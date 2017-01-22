'use strict';

var comongo = require('co-mongo');
var co = require('co');
var foreach = require('generator-foreach')
const MongoClient = require('mongodb').MongoClient

var Promise = require("bluebird");

var convert = require('xml-to-json-promise');
const getContent = require('../lib/getContent');

const ascii = require('../lib/ascii');

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

				let product = {
					id: produkt.$.id,
					category: kategoria.$.nazwa,
					subcategory: podkategoria.$.nazwa,
					name: produkt.$.nazwa,
					provider: produkt.dostawca[0].$.nazwa,
					value: value,
					logo: produkt.dostawca[0].$['logo-male'],
					prez: produkt.linki[0].$.prezentacja,
					application: `http://uki222.systempartnerski.pl${produkt.linki[0].$.wniosek}`,
					description: produkt.opis[0],
					longDescription: `long desc`,
					alive: false,
					updated: false,
					meta: {
						title: "",
						description: "",
						alt: "",
					},

				}

				productList.push(product)
			})
		})
	})

	let actualDb = yield collection.find().toArray();
	actualDb = actualDb.map(product => product.id);

	let newProducts = productList.filter(product => {
		return actualDb.indexOf(product.id) < 0;
	});

	if(newProducts.length) {
		yield collection.insert(newProducts);
	}

	yield db.close( () => console.log('Db updated at: ', new Date()));
}).catch(err => console.log(err))
