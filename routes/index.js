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
    })
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

router.post(/^\/((\w*)\-*(\w*)\.*\-*(\w*))$/,function(req,res){

co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');   
        const products =  yield collection.find().toArray();
        const categories = [...new Set(products.map(product => product.category))];
        const subcategories = [...new Set(products.map(product => product.subcategory))];
        const names = [...new Set(products.map(product => product.name))];
        let check = [];

        const search = req.body.search;

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


    if(/kar.*/.exec(search)){
        check.push('Karty kredytowe');
    }

    else if(/kon.*/.exec(search)){
        check.push('Konta osobiste');
        check.push('Konta mlodziezowe');
    }

    else if(/kre.*/.exec(search)){
        check.push('Kredyty mieszkaniowe');
        check.push('Kredyty gotowkowe');
        check.push('Kredyty konsolidacyjne');
        check.push('Kredyty odnawialne');
        check.push('Kredyty dla firm');
    }
    else if(/dor.*/.exec(search)){
        check.push('Doradztwo ds nieruchomosci');
    }

    else if(/ksie.*/.exec(search)){
        check.push('ksiegarnia');
    }
    else if(/zwrot.*/.exec(search)){
        check.push('Zwrot podatku');
    }
    else if(/pro.*/.exec(search)){
        check.push('Programy niefinansowe');
    }

    else if(/inf.*/.exec(search)){
        check.push('Informacja kredytowa');
    }

    else if(/fun.*/.exec(search)){
        check.push('Fundusze inwestycyjne');
    }
    else if(/lok.*/.exec(search)){
        check.push('Lokaty');
    }
    else if(/ra.*/.exec(search)){
        check.push('Rachunki inwestycyjne');
        check.push('Rachunki firmowe');
    }
    else if(/ike.*/.exec(search)){
        check.push('IKE');
    }
    else if(/inw.*/.exec(search)){
        check.push('Inwestycje alternatywne');
    } 
    else if(/wal.*/.exec(search)){
        check.push('Waluty');
    } 
    else if(/ube.*/.exec(search)){
        check.push('Ubezpieczenia na zycie');
        check.push('Ubezpieczenia majatkowe');
        check.push('Ubezpieczenia komunikacyjne');
        check.push('Ubezpieczenia turystyczne');
    }
    else if(/lea.*/.exec(search)){
        check.push('Leasing');
    } 
    else if(/wal.*/.exec(search)){
        check.push('Waluty');
    } 

    res.render('search_result', {
            products: products,
            categoriesDictionary: categories,
            subcategoriesDictionary: subcategories,
            categoriesMap: categoriesMap,
            subcategoriesMap: subCategoriesMap,
            check: check,
        })
    })
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
    })
});


module.exports = router;