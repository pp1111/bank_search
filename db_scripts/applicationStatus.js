'use strict';

let comongo = require('co-mongo');
let co = require('co');
let request = require("co-request");

const getContent = require('../lib/getContent');

co(function *() {
    let productList = [];

    let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
    let collection = yield db.collection('productsList');


    let products = yield collection.find().toArray();
    products = products.map(product => {
        if (!product.application.redirect) {
            product.application = {
                redirect: product.application,
                isActive: true,
            }
        }

        return product;
    })

    for (let product of products) {
        let result = yield request({
            uri: product.application.redirect,
            method: "GET",
            followAllRedirects: true,
        });

        let inActive = result.body.match(/<h1>(.*?)<\/h1>/) && result.body.match(/<h1>(.*?)<\/h1>/)[0] === '<h1>Przekierowanie anulowane</h1>'
        if (inActive) {
            product.application.isActive = false;
        } else {
            product.application.isActive = true;
        }

        if (inActive && !product.updated) {
            product.alive = false;
        }

        yield collection.update(
            { id: product.id },
            {
                $set:
                {
                    application: product.application,
                    alive: product.alive
                }

            }
        )
    }

    yield db.close( () => console.log('Db updated at: ', new Date()));

}).catch(err => console.log(err))
