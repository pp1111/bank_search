'use strict';

let comongo = require('co-mongo');
let co = require('co');
let request = require("co-request");

co(function *() {
    let productList = [];

    let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
    let collection = yield db.collection('productsList');


    let products = yield collection.find().toArray();

    for (let product of products) {
        yield collection.update(
                { id: product.id },
                {
                    $set:
                    {
                        'application.redirect': product.application.redirect.replace("uki222", "witbee")
                    }
                }, 
                {
                    multi: true
                }
            )
    }

    yield db.close( () => console.log('Db updated at: ', new Date()));

}).catch(err => console.log(err))
