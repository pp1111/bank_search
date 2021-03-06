'use strict';

var comongo = require('co-mongo');
var co = require('co');
var foreach = require('generator-foreach')
const MongoClient = require('mongodb').MongoClient

var Promise = require("bluebird");

var convert = require('xml-to-json-promise');
const getContent = require('../lib/getContent');

const ascii = require('../lib/ascii');

function product (i,c,s,n,p,v,l,pr,a,d,m) {
    this.id = i;
    this.category = c;
    this.subcategory = s;
    this.name = n;
    this.provider = p;
    this.value = v;
    this.logo = l;
    this.prez = pr;
    this.application = a;
    this.description = d;
}

co(function *() {

    let productList = [];

    let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
    let collection = yield db.collection('productsList');

    let content = yield getContent("http://api.systempartnerski.pl/2.0/xml/yU8P2f9BtaN8V8OKj58/", true);
    let parsedContent = yield convert.xmlDataToJSON(content);
    parsedContent.oferta.kategoria.forEach( kategoria => {
        kategoria.podkategoria.forEach( podkategoria => {
            podkategoria.produkt.forEach( produkt => {
                let value = `${produkt.$.nazwa} ${produkt.dostawca[0].$.nazwa}`
                value = value.replace(/ /g,"-")
                value = value.replace(/---/g,"-")
                let p = new product(
                    produkt.$.id,
                    kategoria.$.nazwa,
                    podkategoria.$.nazwa,
                    produkt.$.nazwa,
                    produkt.dostawca[0].$.nazwa,
                    value,
                    produkt.dostawca[0].$['logo-male'],
                    produkt.linki[0].$.prezentacja,
                    `http://uki222.systempartnerski.pl${produkt.linki[0].$.wniosek}`,
                    produkt.opis[0]
                )
                productList.push(p)
            })
        })
    })

    for (var i=0; i<productList.length; i++) {
        yield collection.update(
            { id: productList[i].id },
            {
                $set: {
                    category: productList[i].category,
                    subcategory: productList[i].subcategory,
                    name: productList[i].name,
                    provider: productList[i].provider,
                    value: productList[i].value,
                    logo: productList[i].logo,
                    prez: productList[i].prez,
                    application: productList[i].application,
                    description: productList[i].description,
                }
            },
            {
                upsert: true
            }
        )
    }

    let updatedProductList = yield collection.find().toArray();
    for (var i=0; i<updatedProductList.length; i++) {
        let isNew = !updatedProductList[i].longDescription || !updatedProductList[i].meta
        if (isNew) {
            yield collection.update(
                { id: updatedProductList[i].id },
                {
                    $set: {
                        longDescription: 'long desc',
                        updated: false,
                        alive: true,
                        meta:{
                            title: "",
                            description: "",
                            alt: ""
                        }
                    }   
                }
            )
        }
    }

    yield db.close( () => console.log('Db updated at: ', new Date()));
}).catch(err => console.log(err))
