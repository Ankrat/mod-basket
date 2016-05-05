// Code from https://davidwalsh.name/pubsub-javascript
var eventEmitter = (function() {
    // Specific events to listenTo
    var evts = {};
    // Just a shortcut ;p
    var hOP = evts.hasOwnProperty;

    function subscribe(eventName, fn) {
        // Create the eventName's object if not yet created
        if (!hOP.call(evts, eventName)){ evts[eventName] = []; }

        // Add the fn to queue
        var index = evts[eventName].push(fn) - 1;

        // Provide handle back for removal of eventName
        return {
            remove: function() {
                delete evts[eventName][index];
            }
        };
    }

    function publish(eventName, data) {
        // If the eventName doesn't exist, or there's no fns in queue, just leave
        if (!hOP.call(evts, eventName)){ return; }

        // Cycle through evts queue, fire!
        evts[eventName].forEach(function(fn) {
            fn(data||{});
        });
    }

    return {
        subscribe: subscribe,
        publish: publish
    };

}());

module.exports = eventEmitter;
/*
 * Publishing to an evt:
 *
 * events.publish('/page/load', {
 *     url: '/some/url/path' // any argument
 * });
 *
 * Subscribing to said evt in order to be notified of events:
 *
 * var subscription = events.subscribe('/page/load', function(obj) {
 *     // Do something now that the event has occurred
 * });
 *
 * Sometime later where I no longer want subscription...
 *
 * subscription.remove();
 */