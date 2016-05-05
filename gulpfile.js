var gulp        = require("gulp");
var sourcemaps  = require("gulp-sourcemaps");
var concat      = require("gulp-concat");
var browserSync = require('browser-sync');
var browserify  = require('browserify');
var v_src       = require('vinyl-source-stream');
var jshint      = require('gulp-jshint');
var rename      = require('gulp-rename');
var mocha       = require('gulp-mocha');
var cover       = require('gulp-coverage');



gulp.task("js", ['lint-js'], function () {
    // Move fixture in dist
    gulp.src('./src/scripts/books.json')
        .pipe(gulp.dest("dist/scripts"));

    return browserify(['./src/scripts/main.js'])
    .bundle()
        .pipe(v_src('main.js'))
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task("html", function () {
    return gulp.src(['./src/*.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('lint-js', function() {
    return gulp.src('./src/scripts/modules/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('browserTest', function(){

    // Browser files mocha, chai
    gulp.src('./src/scripts/test/js-frameworks/*.js')
        .pipe(gulp.dest('test'));
    gulp.src('./src/scripts/test/styles/*.css')
        .pipe(gulp.dest('test'));

    // Test spec
    browserify(['./src/scripts/test/basketManager.js'])
        .bundle()
        .pipe(v_src('basketManager.js'))
        .pipe(rename({suffix: "Test"}))
        .pipe(gulp.dest('test'));

    // Tested module
    browserify(['./src/scripts/modules/basketManager.js'])
        .bundle()
        .pipe(v_src('basketManager.js'))
        .pipe(gulp.dest('test'));

    // Test runner
    gulp.src('./src/scripts/test/*.html')
        .pipe(gulp.dest('test'));

    // Run test in console to generate coverage...
    return gulp.src('src/scripts/test/*.js', {read: false})
        .pipe(cover.instrument({
            pattern: ['src/scripts/modules/basketManager.js']
        }))
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'spec'}))
        .pipe(cover.gather())
        .pipe(cover.format())
        .pipe(gulp.dest('test'));
});

gulp.task('test', ['browserTest'], function(){
    browserSync({
        server: {
            baseDir: 'test/'
        },
        port: 8080,
        notify: false
    });
});

gulp.task('unitTest', function(){
    return gulp.src('src/scripts/test/*.js', {read: false})
        .pipe(cover.instrument({
            pattern: ['src/scripts/modules/basketManager.js']
        }))
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'spec'}))
        .pipe(cover.gather())
        .pipe(cover.format())
        .pipe(gulp.dest('test'));
});


gulp.task('default',['js'], function(){
    browserSync({
        server: {
            baseDir: 'dist/'
        },
        port: 8000,
        notify: false
    });

    gulp.watch( ['./src/*.html'], ['html']).on('change', browserSync.reload);
    gulp.watch( ['./src/scripts/main.js'], ['js']).on('change', browserSync.reload);
});