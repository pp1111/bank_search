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
					alive: true,
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

	for (var i = 0; i < actualDb.length; i++) {
		let value = `${productList[i].name} ${productList[i].provider}`
		value = value.replace(/ /g,"-")
	    value = value.replace(/---/g,"-")

		yield collection.update(
			{ id: productList[i].id },
			{
				$set: 
				{
					category: productList[i].category,
					subcategory: productList[i].subcategory,
					name: productList[i].name,
					provider: productList[i].provider,
					description: productList[i].description,
					value: value,
				}

			}
		)
	}

	yield db.close( () => console.log('Db updated at: ', new Date()));
}).catch(err => console.log(err))
