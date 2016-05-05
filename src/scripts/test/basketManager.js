var chai = require('chai');
var expect = chai.expect;


    process.env.dev = true;
    var basketManager = require('../modules/basketManager.js');

    // Fixture
    var prodObject = [{
            "details":{
                "DEWEY":"870.8094",
                "publication_date":"Thu Nov 19 1987 20:57:02 GMT+0000 (UTC)",
                "width":180,
                "height":145,
                "formats":[
                    3,
                    "tempor"
                ],
                "imprint":"Poochies",
                "published_in":[
                    3,
                    "Micronesia"
                ],
                "price": 20.00,
                "publisher":"Zentility",
                "pages":79,
                "ISBN13":7993486167164,
                "DEWEY_edition":45,
                "ISBN":993347784504
            },
            "author":"Lindsay Valdez",
            "image":"http://placehold.it/80x170",
            "title":"Eat fresh",
            "qty":1
        },
        {
            "details":{
                "DEWEY":"870.8094",
                "publication_date":"Thu Nov 19 1987 20:57:02 GMT+0000 (UTC)",
                "width":180,
                "height":145,
                "formats":[
                    3,
                    "tempor"
                ],
                "imprint":"Poochies",
                "published_in":[
                    3,
                    "Micronesia"
                ],
                "price": 12.00,
                "publisher":"Zentility",
                "pages":79,
                "ISBN13":7993486167164,
                "DEWEY_edition":45,
                "ISBN":993347783504
            },
            "author":"Lindsay Valdez",
            "image":"http://placehold.it/80x170",
            "title":"Harry Potter",
            "qty":3
        }];

    // Adaptor for item/product
    function basketItemAdaptor (prod) {
        return {
            item  : prod.title,
            id    : prod.details.ISBN,
            price : prod.details.price,
            qty   : prod.qty || 1
        };
    };

    var prod1 = basketItemAdaptor(prodObject[0]),
        prod2 = basketItemAdaptor(prodObject[1]);

    // Clear basketManager before and after each test
    beforeEach(function() {
        // runs before each test in this block
        basketManager.clearBasket();
    });
    afterEach(function() {
        // runs before each test in this block
        basketManager.clearBasket();
    });






    describe('Basket properties existence:', function(){
        it('basket\'s properties should exist', function(){
            expect(basketManager).to.exist;
            expect(basketManager).to.have.property('addItem');
            expect(basketManager).to.have.property('removeItem');
            expect(basketManager).to.have.property('getItemCount');
            expect(basketManager).to.have.property('getTotal');
            expect(basketManager).to.have.property('clearBasket');
        });
    });


    describe('Add an Item:', function(){
        it('Adding well formatted product should add', function(){
            basketManager.addItem(prod2);
            expect(basketManager.isProductInBasket(prod2)).to.be.true;
        });

        it('Adding badly formatted product should NOT add', function(){
            basketManager.addItem(prod1.item);
            expect(basketManager.isProductInBasket(prod1.item)).to.be.false;
        });

        it('Adding an existing product should increment the qty', function(){
            basketManager.addItem(prod1);
            basketManager.addItem(prod2);
            basketManager.addItem(prod1);
            expect(basketManager.getItemCount()).to.equal(2);
        });
    });


    describe('Remove an item:', function(){
        it('Basket should NOT have prod anymore', function(){
            // Default qty = 2
            // Need to remove twice
            basketManager.addItem(prod1);
            basketManager.removeItem(prod1);
            basketManager.removeItem(prod1);
            expect(basketManager.isProductInBasket(prod1)).to.be.false;
        });

        it('Basket should NOT have 2 qty of prod anymore', function(){
            // Default qty = 3
            // Removed once
            basketManager.addItem(prod2);
            basketManager.removeItem(prod2);
            expect(basketManager.isProductInBasket(prod2)).to.be.true;
        });

        it('Basket should NOT remove unexisting product', function(){
            basketManager.clearBasket();
            basketManager.removeItem(prod1);
            expect(basketManager.isProductInBasket(prod1)).to.be.false;
        });
    });


    describe('Get how many items:', function(){
        it('Adding 1 product => should have 1 item', function(){
            basketManager.clearBasket();
            basketManager.addItem(prod1);
            expect(basketManager.getItemCount()).to.equal(1);
        });
    });


    describe('Get the total of the basket:', function(){
        it('Adding product worth 20.00, should return 20.00', function(){
            basketManager.addItem(prod1);
            // var b= basketManager.getBasket();
            // console.log(" b = ", b);
            expect(basketManager.getTotal()).to.equal(20.00);
        });
    });


    describe('Empty the basket:', function(){
        it('should have 0 item', function(){
            basketManager.clearBasket();
            expect(basketManager.getItemCount()).to.equal(0);
        });
    });

    describe('Get the basket:', function(){
        it('should have 2 items', function(){
            basketManager.addItem(prod1);
            basketManager.addItem(prod2);
            var b = basketManager.getBasket();
            expect( b.length ).to.equal(2);
        });
        it('Item 1 title should be "Eat Fresh"', function(){
            basketManager.addItem(prod1);
            basketManager.addItem(prod2);
            var b = basketManager.getBasket();
            expect( b[0].item ).to.equal('Eat fresh');
        });
        it('Item 2 title should be "Harry Potter"', function(){
            basketManager.addItem(prod1);
            basketManager.addItem(prod2);
            var b = basketManager.getBasket();
            expect( b[1].item ).to.equal('Harry Potter');
        });
    });


    // Private property
    describe('Validate the format of a product:', function(){
        it('Returned value should be a boolean', function(){
            expect(basketManager.isProductValid(prod1)).to.be.a('boolean');
        });

        it('An empty product: {} should return false', function(){
            expect(basketManager.isProductValid({})).to.not.be.ok
        });

        it('{item:"prod"}, missing properties should return false', function(){
            expect(basketManager.isProductValid({item:"prod"})).to.not.be.ok;
        });

        describe('Product properties :', function(){
            it('{item:0.00}, item not a String should return false', function(){
                expect(basketManager.isProductValid({item:0.00, id: 123456, price: 0.00, qty: 1})).to.not.be.ok;
            });
            it('{id: "123456"}, id as a String should return false', function(){
                expect(basketManager.isProductValid({item:"Title", id: "123456", price: 0.00, qty: 1})).to.not.be.ok;
            });
            it('{price: "0.00"}, price as a String should return false', function(){
                expect(basketManager.isProductValid({item:0.00, id: 123456, price: "0.00", qty: 1})).to.not.be.ok;
            });
            it('{qty: "0"}, quantity as a String should return false', function(){
                expect(basketManager.isProductValid({item:0.00, id: 123456, price: 0.00, qty: "0"})).to.not.be.ok;
            });
        });
    });

    describe('Check if specified product is in basket:', function(){
        it('Should be in basket', function(){
           basketManager.addItem(prod1);
           expect(basketManager.isProductInBasket(prod1)).to.be.true;
        });

        it('Should NOT be in basket', function(){
           expect(basketManager.isProductInBasket(prod2)).to.be.false;
        });
    });

