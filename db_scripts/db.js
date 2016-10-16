var comongo = require('co-mongo');
var co = require('co');
var foreach = require('generator-foreach')
const MongoClient = require('mongodb').MongoClient

var Promise = require("bluebird");

var convert = require('xml-to-json-promise');
const getContent = require('../lib/getContent');

const ascii = require('../lib/ascii');

function product (i,c,s,n,p,l,pr,a,d,al,u) {
	this.id = i;
	this.category = c;
	this.subcategory = s;
	this.name = n;
	this.provider = p;
	this.logo = l;
	this.prez = pr;
	this.application = a;
	this.description = d;
	this.alive = al;
	this.updated = u;
}

co(function *() {

	let productList = [];

	let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
	let collection = yield db.collection('productsList');

	let content = yield getContent("http://api.systempartnerski.pl/2.0/xml/yU8P2f9BtaN8V8OKj58/");
	let parsedContent = yield convert.xmlDataToJSON(content);
	parsedContent.oferta.kategoria.forEach( kategoria => {
		kategoria.podkategoria.forEach( podkategoria => {
			podkategoria.produkt.forEach( produkt => {
				p = new product(
					produkt.$.id,
					kategoria.$.nazwa,
					podkategoria.$.nazwa,
					produkt.$.nazwa,
					produkt.dostawca[0].$.nazwa,
					produkt.dostawca[0].$['logo-male'],
					produkt.linki[0].$.prezentacja,
					`http://uki222.systempartnerski.pl${produkt.linki[0].$.wniosek}`,
					produkt.opis[0],	
					true,
					false
				)
				productList.push(p)
			})
		})
	})
	productList.push(
		{
			id: 10000000
		}	
	)
	
	for (var i=0; i<productList.length; i++) {
		yield collection.update(
			{ id: productList[i].id },
			{
				$set: {
					category: productList[i].category,
					subcategory: productList[i].subcategory,
					name: productList[i].name,
					provider: productList[i].provider,
					logo: productList[i].logo,
					prez: productList[i].prez,
					application: productList[i].application,
					description: productList[i].description,
					alive: productList[i].alive,
					updated: productList[i].updated
				}
			},
			{
				upsert: true
			}
		)
	}

	let updatedProductList = yield collection.find().toArray();
	for (var i=0; i<updatedProductList.length; i++) {
		if (!updatedProductList[i].longDescription) {
			yield collection.update(
				{ id: updatedProductList[i].id },
				{
					$set: {
						longDescription: 'long desc'
					}	
				}
			)
		}
	}

	yield db.close();
}).catch(err => console.log(err))
