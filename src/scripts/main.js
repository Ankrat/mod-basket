// Uncomment to add fixtures to the index.html
// In Chrome or Firefox only => fetch API
var htmlStarter = function(){

    function createBookDiv(prod) {
        var defaultConf = {
            title: "defaultTitle",
            author: "defaultAuthor",
            details: {
                formats: ["defaultFormat"],
                ISBN: "1111111111"
            }
        };
        var book = prod || defaultConf;

        var bookTmp = '<div>' +
                        // '<div class="books-list__picture">' +
                        //     '<img src="http://www.placehold.it/165x230?text=Book" alt="cover art, ' + book.title + '" width="165px" height="230px"/>' +
                        // '</div>' +
                        '<div class="books-list__info">' +
                            '<h3>' + book.title + '</h3>' +
                            '<p itemprop="author">' + book.author + '</p>' +
                            '<p class="books-list__format">' + book.details.formats[0] + '</p>' +
                            '<div class="books-list__price">' +
                                '<p class="book-price">&pound;' + book.details.formats[0] + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<button class="js-add-to-basket" data-ISBN="' + book.details.ISBN + '">Add to basket</button>' +
                    '</div>';
        return bookTmp;
    };

    var prodList = document.querySelector(".prod");

    // Using fetch => Chrome and Firefox only
    fetch("/scripts/books.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // Update DOM with data
            var bookList = '';
            // Create bookList
            _.each(data.books, function(book) {
                bookList += createBookDiv(book);
            });
            // Add to the DOM
            prodList.innerHTML = bookList;
        });
};
// Kick start with a few book
// htmlStarter();

function createNewBookDiv(prod) {
    var defaultConf = {
        item: "defaultTitle",
        id: 1111111111,
        price: 0,
        qty: 1
    };
    // var book = prod.book || defaultConf;
    var book = prod || defaultConf;

    var bookTmp = '<div class="book-' + book.id + '">' +
                    '<div class="books-list__info">' +
                        '<h3>' + book.item + '</h3>' +
                        '<div class="books-list__price">' +
                            '<p class="book-price">&pound;' + book.price + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="books-list__qty">' +
                            '<input type="number" step="1" value="' + book.qty + '" data-ISBN="' + book.id + '"/>'+
                        '</div>' +
                    '<button class="js-remove-from-basket" data-ISBN="' + book.id + '">Remove</button>' +
                '</div>';
    return bookTmp;
};

var bm = require("./modules/basketManager.js");
var bBasket; // browserBasket empty at first
var evEmitter = require("./modules/eventEmitter.js");

/**
* @name storageAvailable
* @function
*
* @param type {{String}} - 'localStorage' or 'sessionStorage'
* @return {{Boolean}}
*
* @description: return if a browser has a storage facility
*
*/
function storageAvailable (type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
};

/**
* @name sessionBasket
* @function
*
* @param tmpBasket {{Array}} - array return by the badsketManager
*
*
* @description: update the sessionStorage basket
*
*/
function sessionBasket (tmpBasket) {
    if (storageAvailable('sessionStorage')) {
        // Check previous basket and update/assign according to data
        sessionStorage.setItem('basket', JSON.stringify(tmpBasket));
        bBasket = JSON.parse( sessionStorage.getItem('basket') );
        console.log("Stored Basket = ", bBasket);
    }else{
        // Too bad, no localStorage for us
        // Need to use cookie
        console.log("NO LOCALSTORAGE");
    }
    return;
};


/**
* // DOM
*
*/
    function updateTotal() {
        if( document.querySelector('.basketTotal p') ){
            document.querySelector('.basketTotal p').innerHTML = bm.getTotal().toFixed(2);
        }
        return;
    }

/**
* // DOM
*
*/
    var basketDOM = document.querySelector('.detail');
    var miniBasketDOM = document.querySelector('.mini');

// https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
var addEventBookAdd = function(el) {
    el.addEventListener('click', function(e){ addBook(e); } );
};
var addEventBookRemove = function(el) {
    el.addEventListener('click', function(e){ removeBook(e); } );
};
var addEventBookChange = function(el) {
    el.addEventListener('change', function(e){ updateBasket(e); } );
};
/**
* // DOM
*
*/
    var basketSubscribe = evEmitter.subscribe('basketChange', function(obj) {

        if( obj.action !== "init"){
            bBasket = bm.getBasket();
        }
        var tmpBasket = bBasket;
        // console.log("tmp => ", tmpBasket);
        var bookListUpdate = '';

        sessionBasket(tmpBasket);

        _.each( tmpBasket, function( book ){
            bookListUpdate += createNewBookDiv(book);
        });
        basketDOM.innerHTML = '';
        miniBasketDOM.innerHTML = '';
        basketDOM.innerHTML = bookListUpdate;
        miniBasketDOM.innerHTML = bookListUpdate;

        Array.prototype.forEach.call( basketDOM.querySelectorAll('.js-remove-from-basket'), addEventBookRemove, null);
        // [].forEach.call(basketDOM.querySelectorAll('.js-remove-from-basket'), function (el) {
        //     el.addEventListener('click', function(e){ removeBook(e); } );
        // });
        Array.prototype.forEach.call( miniBasketDOM.querySelectorAll('.js-remove-from-basket'), addEventBookRemove, null);
        // [].forEach.call(miniBasketDOM.querySelectorAll('.js-remove-from-basket'), function (el) {
        //     el.addEventListener('click', function(e){ removeBook(e); } );
        // });
        Array.prototype.forEach.call( basketDOM.querySelectorAll('.books-list__qty input'), addEventBookChange, null);
        Array.prototype.forEach.call( miniBasketDOM.querySelectorAll('.books-list__qty input'), addEventBookChange, null);
        // [].forEach.call(miniBasketDOM.querySelectorAll('.books-list__qty input'), function (el) {
        //     el.addEventListener('change', function(e){ updateBasket(e); } );
        // });

        updateTotal();
    });


/**
* @name initBasket
* @function
*
*
* @description: initialize the basket
*
*/
function initBasket () {
    //***** Store in browser
    // sessionStorage => as long as the browser is open
    if (storageAvailable('sessionStorage')) {
        // Check previous basket and update/assign according to data
        var store = JSON.parse( sessionStorage.getItem('basket') );
        // console.log( _.isEmpty(store) );
        bBasket = _.isEmpty(store) ?  bm.getBasket() : store;
        _.each( bBasket, function(book){
            bm.addItem(book);
            // basketSubscribe need to be before
            // in the scipts
            evEmitter.publish('basketChange', {
                book : book,
                action: "init"
            });
        });
    }else {
        // Too bad, no localStorage for us
        // Need to use cookie
    }
    return;
};
initBasket();

/**
* // DOM
*
*/
    // Add Listener to button add/remove
    function addBook(e) {
        // If js => prevent submission/reload
        e.preventDefault();
        var elem = e.currentTarget;
        var infoBook = {};

        // For json or db lookup
        var item = elem.getAttribute('data-ISBN');

        // Browser use ~
        var bookElem = elem.parentNode;
        infoBook.item = bookElem.querySelector(".books-list__info h3").innerHTML;
        infoBook.id = parseInt(item, 10);
        var priceString = bookElem.querySelector(".book-price").innerHTML;
        infoBook.price = parseFloat(priceString.substr(1, priceString.length), 10);
        infoBook.qty = 1;

        bm.addItem(infoBook);

        evEmitter.publish('basketChange', {
            book : infoBook,
            action: "add"
        });
    }
    function removeBook(e){
            // If js => prevent submission/reload
            e.preventDefault();

            var elem = e.currentTarget;
            var item = elem.getAttribute('data-ISBN');
            var bookList = bm.getBasket();
            var bookToRemove = _.find( bookList, function(b){
                return b.id === parseInt(item, 10);
            });

            bm.removeItem(bookToRemove);
            evEmitter.publish('basketChange', {
                book : bookToRemove,
                action: "remove"
            });
    }
    function updateBasket(e){
            // If js => prevent submission/reload
            // e.preventDefault();

            var elem = e.currentTarget;
            var inQty = parseInt( elem.value, 10 );
            var item = parseInt( elem.getAttribute('data-ISBN'), 10 );

            var bookList = bm.getBasket();
            var bookToUpdate = _.find( bookList, function(b){
                return b.id === item;
            });

            var newQty = inQty - bookToUpdate.qty;

            console.log("inQty = ", inQty);
            console.log("bookToUpdate.qty = ", bookToUpdate.qty);
            console.log("qtyToAdd = ", newQty);
            if( newQty > 0 ){
                bm.updateBasketQty(item, newQty);
            }else{
                bm.removeItem(bookToUpdate);
            }

            evEmitter.publish('basketChange', {
                book : bookToUpdate,
                action: "update"
            });
    }

    var addList = document.querySelectorAll('.js-add-to-basket'),
        removeList = document.querySelectorAll('.js-remove-from-basket');


    Array.prototype.forEach.call(addList, addEventBookAdd, null);
    // [].forEach.call(document.querySelectorAll('.js-add-to-basket'), function (el) {
    //     el.addEventListener('click', function(e){ addBook(e); } );
    // });
    Array.prototype.forEach.call(removeList, addEventBookRemove, null);
    // [].forEach.call(document.querySelectorAll('.js-remove-from-basket'), function (el) {
    //     el.addEventListener('click', function(e){ removeBook(e); });
    // });



// Other page => checkout?
/**
* // DOM
*
*/
    /**
    * @name createCheckout
    * @function
    *
    *
    * @description: Create basket for checkout with stored data
    *
    */
    function createCheckout () {
        var tmpBasket = bBasket;
        var bookListUpdate = '';

        _.each( tmpBasket, function( book ){
            bookListUpdate += createNewBookDiv(book);
        });
        basketDOM.innerHTML = '';
        miniBasketDOM.innerHTML = '';
        basketDOM.innerHTML = bookListUpdate;
        miniBasketDOM.innerHTML = bookListUpdate;

        Array.prototype.forEach.call( basketDOM.querySelectorAll('.js-remove-from-basket'), addEventBookRemove, null);
        // [].forEach.call(basketDOM.querySelectorAll('.js-remove-from-basket'), function (el) {
        //     el.addEventListener('click', function(e){ removeBook(e); } );
        // });
        Array.prototype.forEach.call( miniBasketDOM.querySelectorAll('.js-remove-from-basket'), addEventBookRemove, null);
        // [].forEach.call(miniBasketDOM.querySelectorAll('.js-remove-from-basket'), function (el) {
        //     el.addEventListener('click', function(e){ removeBook(e); } );
        // });
        Array.prototype.forEach.call( basketDOM.querySelectorAll('.books-list__qty input'), addEventBookChange, null);
        Array.prototype.forEach.call( miniBasketDOM.querySelectorAll('.books-list__qty input'), addEventBookChange, null);
        // [].forEach.call(miniBasketDOM.querySelectorAll('.books-list__qty input'), function (el) {
        //     el.addEventListener('change', function(e){ updateBasket(e); } );
        // });
        return;
    };

if( window.location.href === "http://localhost:8000/checkout.html"){
    // New page => new basketManager without knowledges of previous bm...
    //console.log("getBasket = >", bm.getBasket()); // empty
    // But sessionStorage knows => basketInit create a new instance of it
    updateTotal();
    createCheckout();
}


// var EVENTBRITE_URL = "https://www.eventbriteapi.com/v3/";
// var BW_TOKEN = "KXTQXEQTD7KTYGVNHV4Q";
// var SHOP_A_TOKEN = "ACNEYGSZS7RNH6TVPA";

// if(self.fetch) {
//     // run my fetch request here
//     eventBGET("users/me/");
//     eventBGET("users/164985852860/organizers/");
//     eventBGET("users/me/events/");
// } else {
//     // do something with XMLHttpRequest?
// }


// function eventBGET( action ){
//     var myHeaders = new Headers({
//         "Authorization": "Bearer " + BW_TOKEN,
//         "Content-Type": "application/json"
//     });

//     var myInit = { method: 'GET',
//                    headers: myHeaders,
//                    cache: 'default' };

//     fetch(EVENTBRITE_URL+action,myInit)
//     .then(function(response) {
//       return response.json();
//     })
//     .then(function(data) {
//       console.log(data);
//     });
// }