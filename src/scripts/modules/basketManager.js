/**
* BASKET MANAGER
* @description Add / Remove / Count... toolbelt for the shopping basket to be store in javascript
* @module basketManager
*
* @todo Create basket object (sessionStorage?)
*
* @example
* productObj: {
*   item: "bread",
*    price: 0.5
* }
*/
var basketManager = ( function() {

    // Private
    var _ = require('lodash');
    var basket = [];

    // productObj:
    // {
    //   item: "bread",
    //   price: 0.5
    // }
    // Book item
    // {
    //     "details":{
    //         "DEWEY":"870.8094",
    //         "publication_date":"Thu Nov 19 1987 20:57:02 GMT+0000 (UTC)",
    //         "width":180,
    //         "height":145,
    //         "formats":[
    //             3,
    //             "tempor"
    //         ],
    //         "imprint":"Poochies",
    //         "published_in":[
    //             3,
    //             "Micronesia"
    //         ],
    //         "price": 20.00,
    //         "publisher":"Zentility",
    //         "pages":79,
    //         "ISBN13":7993486167164,
    //         "DEWEY_edition":45,
    //         "ISBN":993347784504
    //     },
    //     "author":"Lindsay Valdez",
    //     "image":"http://placehold.it/80x170",
    //     "title":"do ex aliqua",
    //     "qty":1
    // }

    /**
    * @name basketException
    * @function
    *
    * @param method {String}
    * @param message {String}
    * @param value {Object}
    *
    * @description: Log eventual errors
    *
    */
    function basketException(method, message, value) {
        console.log(method+" throw an error: "+ message + " value: " + value);
    }

    /**
    * @name isProductValid
    * @function
    * @static
    *
    * @param productObj {JSON} product key/value pairs
    * @return {Boolean}
    *
    * @description Check if productObj has all key:value pairs?
    *
    */
    function isProductValid(productObj) {
        // item => title, name...
        // id  => ISBN
        // price => 2 digits float 25.99
        // qty => integer > 0
        if( productObj ){
            return ( ( productObj.hasOwnProperty('item') && typeof(productObj.item) === typeof("a") )
                     && ( productObj.hasOwnProperty('id') && typeof(productObj.id) === typeof(1111111111) )
                     && ( productObj.hasOwnProperty('price') && typeof(productObj.price) === typeof(1.25) )
                     && ( productObj.hasOwnProperty('qty') && typeof(productObj.qty) === typeof(1) )
                    );
        }
    }


    /**
    * @name isProductInBasket
    * @function
    * @static
    *
    * @param productObj {JSON} product key/value pairs
    * @return {Boolean}
    *
    * @description Check if an item is already in the basket
    *
    */
    function isProductInBasket(productObj) {
        var isIn = _.findIndex(basket, function(o) { return o.id == productObj.id; });
        return isIn === -1 ? false : true;
    }

    /**
    * @name updateBasketQty
    * @function
    *
    * @param prodID {Number} - ISBN of the item
    * @param prodQty {Number} - quantity to add
    *
    *
    * @description: Update the quantity of a specified item
    *
    */
    function updateBasketQty (prodID, prodQty) {
        var qty = prodQty || 1;
        var index = _.findIndex( basket, function(elem){
            return elem.id === prodID;
        });

        var itemToUpdate = basket[index];

        itemToUpdate.qty += qty;
        basket[index] = itemToUpdate;

        return;
    };

    /**
    * @name addItem
    * @function
    * @static
    *
    * @param productObj {JSON} product key/value pairs
    *
    * @description Add an element to the basket
    *
    */
    function addItem(productObj) {
        if( isProductValid(productObj)  ){

            if( !isProductInBasket(productObj)){
                basket.push(productObj);
            }else{
                updateBasketQty(productObj.id, 1);
            }
        }else{
            basketException("addItem() method", "Can't add, item not fomatted correctly", productObj);
        }
        console.log("basket = ", basket);
        return;
    }

    /*
    * Pure addToCart() returns a new cart
    * It does not mutate the original.
    *
    * const addToCart = (cart, item, quantity) => {
    *   const newCart = lodash.cloneDeep(cart);
    *   newCart.items.push({
    *     item,
    *     quantity
    *   });
    *   return newCart;
    * };
    */

    /**
    * @name removeItem
    * @function
    * @static
    *
    * @param productObj {JSON} product key/value pairs
    *
    * @description Remove an item from the basket
    *
    */
    function removeItem(productObj) {

        if( isProductInBasket(productObj)){
            var indexElem = _.indexOf(basket, productObj);
            var basketItem = basket[indexElem];


            if( basketItem.qty > 1){
                updateBasketQty(productObj.id, -1);
            }else{
                basket = _.reject( basket, function( elem ){
                    return elem.id === productObj.id;
                });
            }
        }else{
            basketException("removeItem()", "Item not found in Basket", productObj);
        }
        return;
    }

    /**
    * @name clearBasket
    * @function
    * @static
    *
    *
    * @description Empty the basket
    * NOTE => look for references in Global object?
    *
    */
    function clearBasket() {
        basket = [];
        return;
    }

    /**
    * @name getItemCount
    * @function
    * @static
    *
    * @return {Integer}
    *
    * @description Return the number of item in the basket
    *
    */
    function getItemCount() {
        return parseInt(basket.length, 10);
    }

    /**
    * @name getTotal
    * @function
    * @static
    *
    * @return {Float}
    *
    * @description Return the total
    *
    */
    function getTotal() {
        var q = getItemCount(),
            p = 0;

        while (q--) {
            var qty = parseInt(basket[q].qty, 10) || 1;
            p += parseFloat(basket[q].price * qty, 10);
        }
        return parseFloat(p);
    }


    /**
    * @name getBasket
    * @function
    *
    * @return {{Object}}
    *
    * @description: return a basket object for sessionStorage
    *
    */
    function getBasket() {
        var basketObj = [];
        var bLength = basket.length;

        for (var i = 0; i < bLength; ++i){
            basketObj.push(basket[i]);
        }
        return basketObj;
    }


    // Node variable set in testSpec
    // to expose all methods to be tested
    if( process.env.dev ){
        return{
            isProductValid    : isProductValid,
            isProductInBasket : isProductInBasket,
            addItem           : addItem,
            removeItem        : removeItem,
            clearBasket       : clearBasket,
            getItemCount      : getItemCount,
            getBasket         : getBasket,
            updateBasketQty   : updateBasketQty,
            basketException   : basketException,
            getTotal          : getTotal
        };
    }else{
        //#JSCOVERAGE_IF
        // Exposed to public
        // For production
        return {
            addItem         : addItem,
            removeItem      : removeItem,
            updateBasketQty : updateBasketQty,
            getItemCount    : getItemCount,
            getTotal        : getTotal,
            getBasket       : getBasket,
            clearBasket     : clearBasket
        };
        //#JSCOVERAGE_ENDIF
    }


}() );


module.exports = basketManager;