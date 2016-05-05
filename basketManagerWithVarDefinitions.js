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
var basketManager = (function () {


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
    var isProductValid = function (productObj) {
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
    };


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
    var isProductInBasket = function (productObj) {
        return _.indexOf(this.basket, productObj) === -1 ? false : true;
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
    var addItem = function (productObj) {
        if( this.isProductValid(productObj)  ){
            if( !this.isProductInBasket(productObj)){
                this.basket.push(productObj);
            }else{
                this.updateBasketQty(productObj.id, 1);
            }
        }else{
            this.basketException("addItem() method", "Can't add, item not fomatted correctly", productObj)

        }
        return;
    };

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
    var updateBasketQty = function (prodID, prodQty) {

        var qty = prodQty || 1;
        var index = _.findIndex( this.basket, function(elem){
            return elem.id === prodID;
        });

        var itemToUpdate = this.basket[index];

        itemToUpdate.qty += qty;
        this.basket[index] = itemToUpdate;

        return;
    };

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
    var removeItem = function (productObj) {

        if( this.isProductInBasket(productObj)){
            var indexElem = _.indexOf(this.basket, productObj);
            var basketItem = this.basket[indexElem];


            if( basketItem.qty > 1){
                this.updateBasketQty(productObj.id, -1);
            }else{
                this.basket = _.reject( this.basket, function( elem ){
                    return elem.id === productObj.id;
                });
            }
        }else{
            basketException("removeItem()", "Item not found in Basket", productObj);
        }
        return;
    };

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
    var clearBasket = function() {
        this.basket = [];
        return;
    };

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
    var getItemCount = function() {
        return parseInt(this.basket.length, 10);
    };

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
    var getTotal = function() {
        var q = this.getItemCount(),
            p = 0;

        while (q--) {
            var qty = parseInt(this.basket[q].qty, 10) || 1;
            p += parseFloat(this.basket[q].price * qty, 10);
        }
        return parseFloat(p);
    };


    /**
    * @name getBasket
    * @function
    *
    * @return {{Object}}
    *
    * @description: return a basket object for sessionStorage
    *
    */
    var getBasket = function() {
        var basketObj = [];
        var bLength = this.basket.length;

        for (var i = 0; i < bLength; ++i){
            basketObj.push(this.basket[i]);
        }
        return basketObj;
    };


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
    var basketException = function (method, message, value) {
        console.log(method+" throw an error: "+ message + " value: " + value);
    };


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
            addItem      : addItem,
            removeItem   : removeItem,
            getItemCount : getItemCount,
            getTotal     : getTotal,
            getBasket    : getBasket,
            clearBasket  : clearBasket
        };
        //#JSCOVERAGE_ENDIF
    }


}());


module.exports = basketManager;