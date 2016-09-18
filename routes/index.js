var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require('http');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var MongoClient = require('mongodb').MongoClient
  , Server = require('mongodb').Server;

var MongoClient = require('mongodb').MongoClient;

var comongo = require('co-mongo');
var co = require('co');

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

function* getProducts(db) {
        let products = yield db.collection('productsList').find({});
        console.log(products);
}

router.get('/', function (req,res){
    let products;
    co(function *() {
        let db = yield comongo.connect('mongodb://127.0.0.1:27017/products');
        let collection = yield db.collection('productsList');   
        let products =  yield collection.find().toArray();
        return products;
    }).then( products => {
        res.render('search', { product: products })
    });
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

  var categories_name = [];
  var subCategories_name = [];
  var products_subcategory = [];
  var products_name = [];
  var products_logo = [];
  var products_provider = [];
  var products_prez = [];
  var products_application = [];
  var products_description = [];

  var search = req.body.search.toString().toLowerCase();
  var check = [];

  function Produkt(a,b,c,d,e,f,g,h){
    this.id = a;
    this.category = b;
    this.name = c;
    this.provider = d;
    this.logo = e;
    this.prez = f;
    this.application = g;
    this.description = h;
  }

  var product_table = [];

  var request = http.get("http://api.systempartnerski.pl/2.0/xml/yU8P2f9BtaN8V8OKj58/",function(response){

  var xml = '';
    response.on('data',function(chunk){
      xml+=toUTF8(chunk);
    });
    response.on('end',function(){

      parseString(xml, function(err,result){
        for(var key in result.oferta.kategoria){
         categories_name.push(result.oferta.kategoria[key].$.nazwa);
        }

        result.oferta.kategoria.forEach(function(entry){
            for(var key in entry.podkategoria){
             subCategories_name.push(asciiOff(entry.podkategoria[key].$.nazwa));
            }
        });

        result.oferta.kategoria.forEach(function(entry){
           for(var key in entry.podkategoria){
              for(var i in entry.podkategoria[key].produkt){
                products_subcategory.push(asciiOff(entry.podkategoria[key].$.nazwa));
                 for(var j in entry.podkategoria[key].produkt[i].dostawca){
                    products_name.push(entry.podkategoria[key].produkt[i].$.nazwa);
                    products_provider.push(entry.podkategoria[key].produkt[i].dostawca[j].$.nazwa);
                    products_logo.push(entry.podkategoria[key].produkt[i].dostawca[j].$['logo-male']);
                 }
                  for(var j in entry.podkategoria[key].produkt[i].linki){
                    products_prez.push(entry.podkategoria[key].produkt[i].linki[j].$.prezentacja);
                    products_application.push("http://uki222.systempartnerski.pl" + entry.podkategoria[key].produkt[i].linki[j].$.wniosek);
                 }
                  for(var j in entry.podkategoria[key].produkt[i].opis){
                    var temp = entry.podkategoria[key].produkt[i].opis.toString();
                    temp = temp.replace(/<li>/g,"");
                    temp = temp.replace(/<\/li>/g,"");
                    temp = temp.replace(/<ul>/g,"");
                    temp = temp.replace(/<\/ul>/g,"");
                    // temp = temp.replace(/\r\n/g,"");
                    temp = temp.replace(/<\/small>/g,"");
                    temp = temp.replace(/<\/p>/g,"");
                    temp = temp.replace(/<small>/g,"");
                    temp = temp.replace(/<p>/g,"");
                    products_description.push(temp);
                 }

              }
            }
        })
        
        for(var i=0;i<=products_name.length;i++){
            var p = new Produkt(i,products_subcategory[i],products_name[i],products_provider[i],products_logo[i],products_prez[i],products_application[i],products_description[i]);
            product_table.push(p);
        }

        if(/kar.*/.exec(search.to)){
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

        else{
          check = null;
          res.render('search',{
             categories: categories_name,
             subCategories: subCategories_name,
             products: products_name,
             komunikat: 'Brak wyników wyszukania'
          });
        }

        if(check!==null){
          res.render('search_result',{
               categories: categories_name,
               subCategories: subCategories_name,
               productName: products_name,
               productProvider: products_provider,
               productLogo: products_logo,
               productApplication: products_application,
               productPrez: products_prez,
               products: product_table,
               check: check
          });
        }

      });
    });

  });
});

                  
router.get('/finanse/:category', function(req,res){

  var categories_name = [];
  var subCategories_name = [];
  var products_subcategory = [];
  var products_name = [];
  var products_logo = [];
  var products_provider = [];
  var products_prez = [];
  var products_application = [];
  var products_description = [];
  var check = [];

  console.log(req.params.category);
  check.push(req.params.category.replace(/-/g, ' '));

  function Produkt(a,b,c,d,e,f,g,h){
    this.id = a;
    this.category = b;
    this.name = c;
    this.provider = d;
    this.logo = e;
    this.prez = f;
    this.application = g;
    this.description = h;
  }

  var product_table = [];

  var request = http.get("http://api.systempartnerski.pl/2.0/xml/yU8P2f9BtaN8V8OKj58/",function(response){

  var xml = '';
    response.on('data',function(chunk){
        xml+=toUTF8(chunk);
    });
    response.on('end',function(){

      parseString(xml, function(err,result){
        for(var key in result.oferta.kategoria){
         categories_name.push(result.oferta.kategoria[key].$.nazwa);
        }

        result.oferta.kategoria.forEach(function(entry){
            for(var key in entry.podkategoria){
              subCategories_name.push(asciiOff(entry.podkategoria[key].$.nazwa));
            }
        });

        result.oferta.kategoria.forEach(function(entry){
           for(var key in entry.podkategoria){
              for(var i in entry.podkategoria[key].produkt){
                products_subcategory.push(asciiOff(entry.podkategoria[key].$.nazwa));
                 for(var j in entry.podkategoria[key].produkt[i].dostawca){
                    products_name.push(entry.podkategoria[key].produkt[i].$.nazwa);
                    products_provider.push(entry.podkategoria[key].produkt[i].dostawca[j].$.nazwa);
                    products_logo.push(entry.podkategoria[key].produkt[i].dostawca[j].$['logo-male']);
                 }
                  for(var j in entry.podkategoria[key].produkt[i].linki){
                    products_prez.push(entry.podkategoria[key].produkt[i].linki[j].$.prezentacja);
                    products_application.push("http://uki222.systempartnerski.pl" + entry.podkategoria[key].produkt[i].linki[j].$.wniosek);
                 }
                  for(var j in entry.podkategoria[key].produkt[i].opis){
                    var temp = entry.podkategoria[key].produkt[i].opis.toString();
                    temp = temp.replace(/<li>/g,"");
                    temp = temp.replace(/<\/li>/g,"");
                    temp = temp.replace(/<ul>/g,"");
                    temp = temp.replace(/<\/ul>/g,"");
                    // temp = temp.replace(/\r\n/g,"");
                    temp = temp.replace(/<\/small>/g,"");
                    temp = temp.replace(/<\/p>/g,"");
                    temp = temp.replace(/<small>/g,"");
                    temp = temp.replace(/<p>/g,"");
                    products_description.push(temp);
                 }

              }
            }
        })
        
        for(var i=0;i<products_name.length;i++){
            var p = new Produkt(i,products_subcategory[i].replace(/-/g, ' '),products_name[i],products_provider[i],products_logo[i],products_prez[i],products_application[i],products_description[i]);
            product_table.push(p);
        }

          res.render('search_result',{
               categories: categories_name,
               subCategories: subCategories_name,
               productName: products_name,
               productProvider: products_provider,
               productLogo: products_logo,
               productApplication: products_application,
               productPrez: products_prez,
               products: product_table,
               check: check
          });

      });
    });

  });

});


module.exports = router;