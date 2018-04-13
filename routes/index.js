const express = require('express');
const router = express.Router();

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const comongo = require('co-mongo');
const co = require('co');
const foreach = require('generator-foreach')
const Promise = require("bluebird");

const getContent = require('../lib/getContent');

const ascii = require('../lib/ascii');

const Mailer = require('./../lib/mailer')
const mailerConfig = Mailer.getMailerConfig(config.email);
const mailer = new Mailer(mailerConfig);

router.get('/', function (req, res) {
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');   
        let products =  yield collection.find({ alive: true }).toArray();
        let categories = [...new Set(products.map(product => product.category))];
        let subcategories = [...new Set(products.map(product => product.subcategory))];
        let names = [...new Set(products.map(product => product.name))];

        let categoriesMap = {};
        let subCategoriesMap = {};
        yield Promise.each(categories, co.wrap(function*(category) {
            categoriesMap[category] = yield collection.find({category: category}).toArray();
        }));

        yield Promise.each(subcategories, co.wrap(function*(subcategory) {
            subCategoriesMap[subcategory] = yield collection.find({subcategory: subcategory}).toArray();
        }));

        categories.forEach( category => {
            categoriesMap[category] = [...new Set (categoriesMap[category].filter(product => product.alive).map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })
	yield db.close();
        res.render('search', {
            product: products,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            suggestions: req.query.suggestions
        })
    }).catch(err => console.log(err))
});

router.get('/specyfikacja',function (req, res) {
  res.render('specyfikacja');
});

router.get('/kontakt', function (req, res) {
    res.render('contact');
});

router.post('/kontakt', function (req, res) {
    mailer.send(config.email.to, 'Amoney wiadomość', `${req.body.message} ${req.body.email}`).catch(err => console.log(err))
    res.render('contact');
});

router.get('/finanse', function (req, res) {
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');   
        let products =  yield collection.find({alive: true}).toArray();
        let categories = [...new Set(products.map(product => product.category))];
        let subcategories = [...new Set(products.map(product => product.subcategory))];
        let names = [...new Set(products.map(product => product.name))];
        let productList;

        let categoriesMap = {}; 
        let subCategoriesMap = {};
        yield Promise.each(categories, co.wrap(function*(category) {
            categoriesMap[category] = yield collection.find({category: category}).toArray();
        }));

        yield Promise.each(subcategories, co.wrap(function*(subcategory) {
            subCategoriesMap[subcategory] = yield collection.find({subcategory: subcategory}).toArray();
        }));

        categories.forEach( category => {
            categoriesMap[category] = [...new Set (categoriesMap[category].filter(product => product.alive).map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })
        
        query = req.query.q.replace(/ /g,"-");
        query = decodeURIComponent(query);

        var result = yield getContent('http://localhost:4000/search/data?q=' + query, false);
        result = JSON.parse(result);

        result.response.docs.forEach( product => {
            product.name = product.name.replace(/_/g, ' ');
        })

        productList = result.response.docs = result.response.docs.map(product => {
            product.value = product.value.replace(/%/g, '%25');
            return product;
        })

        const dataLayerObject = {
            ecommerce: {
                currencyCode: 'PLN',
                impressions: productList.map((product, acc) => {
                    return {
                        name: `${product.name} ${product.provider}`,
                        id: product.id,
                        price: 0,
                        brand: product.provider,
                        category: `${product.category}/${product.subcategory}`,
                        variant: ``,
                        list: `Search_results`,
                        position: acc + 1,
                    }
                }),
            },
        }
	yield db.close();
        res.render('search_result', {
            productList: productList,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            dataLayerObject: JSON.stringify(dataLayerObject),
        })
    }).catch(err => console.log(err))
});

router.get('/finanse/produkt/:productValue', function (req, res) {
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');
        let products =  yield collection.find({ alive: true }).toArray();
        let categories = [...new Set(products.map(product => product.category))];
        let subcategories = [...new Set(products.map(product => product.subcategory))];
        let names = [...new Set(products.map(product => product.name))];
        let check = [];

        let categoriesMap = {};
        let subCategoriesMap = {};
        yield Promise.each(categories, co.wrap(function*(category) {
            categoriesMap[category] = yield collection.find({category: category}).toArray();
        }));

        yield Promise.each(subcategories, co.wrap(function*(subcategory) {
            subCategoriesMap[subcategory] = yield collection.find({subcategory: subcategory}).toArray();
        }));

        categories.forEach( category => {
            categoriesMap[category] = [...new Set (categoriesMap[category].filter(product => product.alive).map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })

        let selectedProduct = yield collection.find({value: req.params.productValue}).toArray();
        let suggestions = yield collection.find({ id: { $ne: selectedProduct[0].id }, subcategory: selectedProduct[0].subcategory }).toArray();

        suggestions = suggestions.map(suggestion => {
            suggestion.value = suggestion.value.replace(/%/g, '%25');
            return suggestion;
        }).filter(suggestion => {
            return suggestion.alive
        })

        suggestions.map((suggestion, acc)=> {
            let temp;
            if (suggestion.value === 'Pożyczka-pozabankowa-inCredit') {
                temp = suggestions[0];
                suggestions[0] = suggestions[acc];
                suggestions[acc] = temp;
            }
        })

        const details = {
            name: `${selectedProduct[0].name} ${selectedProduct[0].provider}`,
            id: selectedProduct[0].id,
            price: 0,
            brand: selectedProduct[0].provider,
            category: `${selectedProduct[0].category}/${selectedProduct[0].subcategory}`,
            variant: '',
        };

        const dataLayerObject = {
            ecommerce: {
                detail: {
                    actionField: {
                        list: 'Szczegóły produktu',
                    },
                    products: [details],
                },
                impressions: []
            },
        }

        if (req.query.selectFromSuggestions) {
            dataLayerObject.ecommerce.impressions.push({
                name: `${selectedProduct[0].name} ${selectedProduct[0].provider}`,
                id: selectedProduct[0].id,
                price: 0,
                brand: selectedProduct[0].provider,
                category: `${selectedProduct[0].category}/${selectedProduct[0].subcategory}`,
                variant: '',
                position: 1,
                list: `Search_product_direct`
            });
        }

        dataLayerObject.ecommerce.impressions = dataLayerObject.ecommerce.impressions.concat(suggestions.map((product, acc) => {
            return {
                name: `${product.name} ${product.provider}`,
                id: product.id,
                price: 0,
                brand: product.provider,
                category: `${product.category}/${product.subcategory}`,
                variant: ``,
                list: `Product_details`,
                position: acc + 1,
            }
        }));
	yield db.close();
        res.render('selected_product', {
            product: selectedProduct[0],
            suggestedProducts: suggestions,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            dataLayerObject: JSON.stringify(dataLayerObject),
        })

    }).catch(err => console.log(err))
});
    
router.get('/finanse/:category', function (req, res){
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');

        let products =  yield collection.find({ alive: true }).toArray();
        let categories = [...new Set(products.map(product => product.category))];
        let subcategories = [...new Set(products.map(product => product.subcategory))];
        let names = [...new Set(products.map(product => product.name))];
        let productList = [];

        let subcategoriesColl = yield db.collection('subcategories');
        let mongoSubcategories = yield subcategoriesColl.find().toArray();

        let sub = mongoSubcategories.filter(subcategory => subcategory.name.replace(/-/g, " ") == req.params.category.replace(/-/g, " "));

        let categoriesMap = {};
        let subCategoriesMap = {};
        yield Promise.each(categories, co.wrap(function*(category) {
            categoriesMap[category] = yield collection.find({category: category}).toArray();
        }));

        yield Promise.each(subcategories, co.wrap(function*(subcategory) {
            subCategoriesMap[subcategory] = yield collection.find({subcategory: subcategory}).toArray();
        }));

        categories.forEach( category => {
            categoriesMap[category] = [...new Set (categoriesMap[category].filter(product => product.alive).map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })

        if (req.params.category == 'e-Sklepy') {
            productList = products.filter(product => product.subcategory == req.params.category);
        } else {
            productList = products.filter(product => product.subcategory == req.params.category.replace(/-/g, ' '));
        }

        if (req.params.category === 'Karty-kredytowe') {
            productList.forEach((product, acc) => {
                let temp;
                if (product.value === 'Karta-Kredytowa-Citibank-MasterCard-World-Citi-Handlowy') {
                    temp = productList[0];
                    productList[0] = productList[acc];
                    productList[acc] = temp;
                }

                if (product.value === 'TurboKARTA-Idealne-wsparcie-dla-Kierowcy-Santander-Consumer-Bank') {
                    temp = productList[1];
                    productList[1] = productList[acc];
                    productList[acc] = temp;
                }

                if (product.value === 'World-MasterCard-Class&Club-Raiffeisen-Bank-Polska-S.A.') {
                    temp = productList[2];
                    productList[2] = productList[acc];
                    productList[acc] = temp;
                }
            })
        }

        if (req.params.category === 'Pożyczki-pozabankowe') {
            productList.forEach((product, acc) => {
                let temp;
                if (product.value === 'Pożyczka-pozabankowa-inCredit') {
                    temp = productList[0];
                    productList[0] = productList[acc];
                    productList[acc] = temp;
                }
            })
        }

        const dataLayerObject = {
            ecommerce: {
                currencyCode: 'PLN',
                impressions: productList.map((product, acc) => {
                    return {
                        name: `${product.name} ${product.provider}`,
                        id: product.id,
                        price: 0,
                        brand: product.provider,
                        category: `${product.category}/${product.subcategory}`,
                        variant: ``,
                        list: `Menu`,
                        position: acc + 1,
                    }
                }),
            },
        }
	yield db.close();
        res.render('search_result', {
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            productList: productList,
            dataLayerObject: JSON.stringify(dataLayerObject),
            mongoSubcategories: mongoSubcategories,
            subcategory: sub[0]
        })
    }).catch(err => console.log(err))
});

module.exports = router;
