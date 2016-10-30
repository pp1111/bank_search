const express = require('express');
const router = express.Router();
const url = require('url');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const comongo = require('co-mongo');
const co = require('co');
const foreach = require('generator-foreach')
const Promise = require("bluebird");

const getContent = require('../lib/getContent');

const array = require('lodash/array');
const ascii = require('../lib/ascii');

const Mailer = require('./../lib/mailer')
const mailerConfig = Mailer.getMailerConfig(config.email);
const mailer = new Mailer(mailerConfig);

router.get('/', function (req, res) {
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');   
        let products =  yield collection.find().toArray();
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
            categoriesMap[category] = [...new Set (categoriesMap[category].map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })
        
        res.render('search', {
            product: products,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
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
        let products =  yield collection.find().toArray();
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
            categoriesMap[category] = [...new Set (categoriesMap[category].map(product => product.subcategory))];
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

        let searchedSubcategories = [...new Set(result.response.docs.map(product => product.subcategory))];

        searchedSubcategories.forEach( subcategory => {
            check.push(subcategory);
        })

        res.render('search_result', {
            products: result.response.docs,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            check: check,
        })
    }).catch(err => console.log(err))
});

router.get('/finanse/produkt/:productValue', function (req, res) {
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');
        let products =  yield collection.find().toArray();
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
            categoriesMap[category] = [...new Set (categoriesMap[category].map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })

        console.log(req.params.productValue);
        let selectedProduct = yield collection.find({value: req.params.productValue}).toArray();
        let query = `${selectedProduct[0].name}`.replace(/ /g,"-");
        query = escape(query);

        let suggestions = yield getContent('http://localhost:4000/search/data?q=' + query, false);
        suggestions = JSON.parse(suggestions);
        suggestions = suggestions.response.docs.slice(1,10);

        res.render('selected_product', {
            product: selectedProduct[0],
            suggestedProducts: suggestions,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
        })

    }).catch(err => console.log(err))
});
    
router.get('/finanse/:category', function (req, res){
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');   
        let products =  yield collection.find().toArray();
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
            categoriesMap[category] = [...new Set (categoriesMap[category].map(product => product.subcategory))];
        })

        subcategories.forEach( subcategory => {
            subCategoriesMap[subcategory] = [...new Set (subCategoriesMap[subcategory].map(product => product.name))];
        })
        
        check.push(req.params.category.replace(/-/g, ' '));

        res.render('search_result', {
            products: products,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            check: check,
        })
    }).catch(err => console.log(err))
});

module.exports = router;