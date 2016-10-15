var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require('http');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var comongo = require('co-mongo');
var co = require('co');
var foreach = require('generator-foreach')
var Promise = require("bluebird");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const getContent = require('../lib/getContent');

var array = require('lodash/array');

var iconv = require('iconv');

function toUTF8(body) {
  // convert from iso-8859-1 to utf-8
  var ic = new iconv.Iconv('iso-8859-2', 'utf-8');
  var buf = ic.convert(body);

  return buf.toString('utf-8');
}

function asciiOff(body) {
  // convert from iso-8859-1 to utf-8
  var ic = new iconv.Iconv('UTF-8', 'ASCII//TRANSLIT');
  var buf = ic.convert(body);

  buf = buf.toString().replace(/'/g,"");
  return buf.toString('utf-8');
}

router.get('/', function (req,res){
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

router.get('/specyfikacja',function(req,res){
  res.render('specyfikacja');
});

router.get('/kontakt', function(req,res){
    res.render('contact');
});

router.post('/kontakt', function (req, res) {
  var mailOpts;
  //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.

  var transporter = nodemailer.createTransport((smtpTransport({
    host : "Smtp.gmail.com",
    secureConnection : false,
    port: 587,
    auth: {
        user: 'piatekpatryk2@gmail.com',
        pass: '9984149a'
    }
})));

  //Mail options
  mailOpts = {
      from: req.body.email, //grab form data from the request body object
      to: 'piatekpatryk2@gmail.com',
      subject: 'Kalkulator walut wiadomość',
      text: req.body.message + " " + req.body.email
  };

  console.log(req.body.name);
  console.log(req.body.email);
  console.log(req.body.message);

  transporter.sendMail(mailOpts, function (error, response) {
    if(error){
      res.send('error');
    }
    else{
        res.render('contact');
    }
  });

});


router.get('/finanse', function(req,res){
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
        
        query = req.query.q.replace(/ /g,"_");
        var result = yield getContent('http://localhost:4000/search/data?q=' + query);
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
    
router.get('/finanse/:category', function(req,res){
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