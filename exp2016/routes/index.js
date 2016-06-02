var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require('http');
var request = require('request');
var url = require('url');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
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

var now = new Date();
var currentYear = now.getFullYear();   
var currentMonth = now.getMonth() +1;
var currentDay = now.getDate();
var currentHour = now.getHours();

function rand( min, max ){
    min = parseInt( min, 10 );
    max = parseInt( max, 10 );

    if ( min > max ){
        var tmp = min;
        min = max;
        max = tmp;
    }

    return Math.floor( Math.random() * ( max - min + 1 ) + min );
}


router.get('/',function(req,res){

  var categories_name = [];
  var subCategories_name = [];
  var products_name = [];

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
                products_name.push(entry.podkategoria[key].produkt[i].$.nazwa);
              }     
            }
        })

        console.log(subCategories_name);

          res.render('search',{
           categories: categories_name,
           subCategories: subCategories_name,
           products: products_name,
           komunikat: ''
          });
      });
    });

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

  var search = req.body.search.toString();
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
        
        for(var i=0;i<products_name.length;i++){
            var p = new Produkt(i,products_subcategory[i],products_name[i],products_provider[i],products_logo[i],products_prez[i],products_application[i],products_description[i]);
            product_table.push(p);
        }



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


router.get('/kalkulator-walut', function (req, res) {

    var request = http.get("http://www.nbp.pl/kursy/xml/a025z100205.xml", function(response) { 
      var xml = ''; 

        response.on('data', function(chunk) { 
           xml += chunk; 
         });

        response.on('end', function() {
             parseString(xml, function (err, result) {
                        
                  res.render('calcStartPage',{
                    title: "AMoney Nowe Oblicze Finansów",
                    description: "AMoney to zaawansowany kalkulator finansowy, który opiera się na danych Narodowego Banku Polskiego. Sprawdź co oferuje.",
                    amount: "",
                    year: currentYear-2000, 
                    month: currentMonth,
                    day: currentDay,
                    cash: result.tabela_kursow.pozycja,
                    selected1: "PLN",
                    selected2: "EUR"
                  });
             });
        });
    });
  
});


router.get(/^\/przelicznik\/(\w+)\-(\w+)\-(\w+)\/(\w+)\-na-(\w+)\-(\-*(\w+)\.*(\w*))\-(\w+)\-ile-to-(\w+)$/ , function(req,res) {
 

  var title = "Przelicznik" + " " + req.params[3] + " na " + req.params[4] + "." + req.params[5] + " " + req.params[3] + " ile to " + req.params[4];
  var description = title + " ? Sprawnie obliczysz to za pomocą kalkulatora EMoney. Obliczenia oparte o kursy NBP. Sprawdź";

  var step1 = req.params[3];
  var step2 = req.params[4];
  var step3 = req.params[5];
  var pln = 1;
  var url = "";
  var temp1 = req.params[1];
  var temp2 = req.params[2];
  var date = new Date(20+req.params[0],req.params[1]-1,req.params[2],0,0,0);
  var entryTab = [];

  console.log("\nWybrana data: ", date);
  
  console.log("Pobrane parametry: \n", req.params);

  if(req.params[0] == 16){
    url = "http://www.nbp.pl/kursy/xml/dir.txt";
  } else {
    url = "http://www.nbp.pl/kursy/xml/dir20" + req.params[0] + ".txt";
  }
  
  console.log("\nSzukamy daty w pliku: ", url);

  var getUrl = http.get(url, function(response){
      var xml = ''
    
      response.on('data', function(chunk) {
          xml += chunk;
      });

      response.on('end', function(){
          var rx = /a/g;
          var array;
          var sub = "";
          var search = req.params[0] + req.params[1] + req.params[2];
          var newUrl;
          var licznik=0;
    
          while((array = rx.exec(xml)) !== null){
              sub += xml.substring(array.index,array.index+11) + "\n";
          }
         

          newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);

          if(newUrl.length != 11){
            console.log("\nUrl o podanej dacie nie istnieje, szukamy najblizszej: ");
          }
          else{
            console.log("\nWyszukana data: ", newUrl);
          }
          
          if(req.params[1] == 1 && (req.params[2] == 1 || req.params[2] == 2 || req.params[2] == 3)){
              while(newUrl.length !=11 && licznik < 100){
                    search++;
                    temp2++;   
                    licznik++;
                    console.log("szukamy...",search);     
                    newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);
              }
          } else {
              while(newUrl.length !=11 && licznik < 100){
                    search--;
                    temp2--;   
                    licznik++;
                    console.log("szukamy...",search);     
                    newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);
              }
          }

            if(!rx.test(newUrl)){ 
                  newUrl = "a" + newUrl.substring(0,10); 
                  console.log(newUrl); 
            }

         if(temp2>=100){
              temp1++;
              temp2 = temp2 - 100;
            }

          if(temp2<=-70){
              temp1--;
              temp2 = temp2+100;
            }

          if(temp1.toString().length < 2){
            temp1 = '0' + temp1;
          }

          if(temp2.toString().length < 2){
            temp2 = '0' + temp2;
          }

  
          console.log("\nWyszukana data: ",newUrl);

          url = "http://www.nbp.pl/kursy/xml/" + newUrl + ".xml";
          console.log("\nCaly Url : ", url);

          if(licznik===100){         
              var request = http.get("http://www.nbp.pl/kursy/xml/a025z100205.xml", function(response) { 
                var xml = ''; 

                  response.on('data', function(chunk) { 
                     xml += chunk; 
                   });

                  response.on('end', function() {

                       parseString(xml, function (err, result) {
                                  
                         result.tabela_kursow.pozycja.forEach(function(entry){
                              entryTab.push(entry.kod_waluty[0]);
                          }); 

                          draw1 = entryTab[rand(0,34)];
                          draw2 = entryTab[rand(0,34)];

                            res.render('calcMain', { 
                                  title: title,
                                  description: description,
                                  cash: result.tabela_kursow.pozycja,
                                  kurs: "", 
                                  selected1: req.params[3],
                                  selected2: req.params[4],
                                  amount: req.params[5],
                                  year: req.params[0], 
                                  month: req.params[1],
                                  day: req.params[2],
                                  resultday: "",
                                  resultmonth: "",
                                  wynik:"",
                                  date: "",
                                  result_text: '',
                                  result: "Brak aktualizacji nbp z danego dnia, aktualizacje dokonywane są w dni robocze ok. godziny 12",
                                  result1: "show",
                                  result2: "hidden",
                                  contact: "hidden",
                                  draw1 : draw1,
                                  draw2 : draw2,
                                  rand_amount : rand(10,50),
                                  rand_year : rand(12,16),
                                  rand_month : '0'+ rand(1,5),
                                  rand_day : rand(10,30)
                            });    
                       });
                  });
              });
          }

          else{

            var request = http.get(url, function(response) { 
                var xml = ''; 

                  response.on('data', function(chunk) { 
                      xml += chunk; 
                  });

                  response.on('end', function() {

                        parseString(xml, function (err, result) {

                          result.tabela_kursow.pozycja.forEach(function(entry){
                              entryTab.push(entry.kod_waluty[0]);
                          });


                          draw1 = entryTab[rand(0,34)];
                          draw2 = entryTab[rand(0,34)];

                            if(step1 == "PLN"){
                                 step1 = step3 * pln;
                                 console.log("\nKrok1 = ilosc * waluta: ", step1, step3, pln);
                            } 
                            else { 
                               result.tabela_kursow.pozycja.forEach(function(entry) {
                                    if(step1 == entry.kod_waluty[0]){
                                    step1 = step3 * entry.kurs_sredni[0].replace(",",".");
                                    console.log("\nKrok1 = ilosc * waluta: ", step1, step3, entry.kod_waluty[0]);
                                    }   
                                });
                            }

                            if(step2 == "PLN"){
                                  step2 = step1 / pln;
                                  console.log("\nKrok2 = Krok1 / waluta: ", step2.toFixed(2), step1, pln);
                                  kurs = step2.toFixed(2);

                                   res.render('calcMain', { 
                                                title: title,
                                                description: description,
                                                cash: result.tabela_kursow.pozycja,
                                                kurs: kurs,
                                                selected1: req.params[3],
                                                selected2: req.params[4],
                                                amount: req.params[5], 
                                                year: req.params[0], 
                                                month: req.params[1],
                                                day: req.params[2],
                                                resultday: temp2,
                                                resultmonth: temp1,
                                                wynik: "Przelicznik" + " " + req.params[3] + " na " + req.params[4],
                                                date: "Kurs nbp z dnia: " + req.params[0] + "-" + temp1 + "-" + temp2,
                                                result_text: '',
                                                result: req.params[5] + " " + req.params[3] + " to " + kurs + " " + req.params[4],
                                                result1: "show",
                                                result2: "show",
                                                contact: "hidden",
                                                draw1 : draw1,
                                                draw2 : draw2,
                                                rand_amount : rand(10,50),
                                                rand_year : rand(12,16),
                                                rand_month : '0'+ rand(1,5),
                                                rand_day : rand(10,30)
                                            });
                            } else {
                                  result.tabela_kursow.pozycja.forEach(function(entry) {
                                      if(step2 == entry.kod_waluty[0]){
                                        step2 = step1 / entry.kurs_sredni[0].replace(",",".");
                                        console.log("\nKrok2 = Krok1 / waluta: ", step2.toFixed(2), step1, entry.kurs_sredni[0]);
                                        kurs = step2.toFixed(2);

                                            res.render('calcMain', { 
                                                title: title,
                                                description: description,
                                                cash: result.tabela_kursow.pozycja,
                                                kurs: kurs,
                                                selected1: req.params[3],
                                                selected2: req.params[4],
                                                amount: req.params[5],
                                                year: req.params[0], 
                                                month: req.params[1],
                                                day: req.params[2],
                                                resultday: temp2,
                                                resultmonth: temp1,
                                                wynik: "Przelicznik" + " " + req.params[3] + " na " + req.params[4],
                                                date: "Kurs nbp z dnia: " + req.params[0] + "-" + temp1 + "-" + temp2,
                                                result_text: '',
                                                result: req.params[5] + " " + req.params[3] + " to " + kurs + ' ' + req.params[4],
                                                result1: "show",
                                                result2: "show",
                                                contact: "hidden",
                                                draw1 : draw1,
                                                draw2 : draw2,
                                                rand_amount : rand(10,50),
                                                rand_year : rand(12,16),
                                                rand_month : '0'+ rand(1,5),
                                                rand_day : rand(10,30)
                                            });
                                      }
                                  }) 
                              }

                        });
                  });
            });
          }
        });


    });
  });


router.get(/^\/przelicznik\/(\w+)\-(\w+)\-(\w+)\/(\w+)\-na-(\w+)\-\-(\w+)\-ile-to-(\w+)$/ , function(req,res) {

  var title = "Przelicznik" + " " + req.params[3] + " na " + req.params[4] + "." +  " " + req.params[3] + " ile to " + req.params[4];
  var description = title + " ? Sprawnie obliczysz to za pomocą kalkulatora EMoney. Obliczenia oparte o kursy NBP. Sprawdź";
  var result_text = "Drogi użytkowniku, próbujesz przeliczyć walutę z " + req.params[3] + " na " + 
                    req.params[4]+"."+" Niestety nie podałeś żadnej kwoty do przeliczenia:( Jeśli chcesz przeliczć inną wartość, niż 1 " + 
                    req.params[3]+", na "+req.params[4] + ",wpisz ją proszę w pole wyszukiwania, obok pola oblicz. ";                    

  var step1 = req.params[3];
  var step2 = req.params[4];
  var step3 = 1;
  var pln = 1;
  var url = "";
  var temp1 = req.params[1];
  var temp2 = req.params[2];
  var entryTab = [];
  var date = new Date(20+req.params[0],req.params[1]-1,req.params[2],0,0,0);

  console.log("\nPobrana data: ", date);

  console.log("Pobrane parametry: \n", req.params);

  if(req.params[0] == 16){
    url = "http://www.nbp.pl/kursy/xml/dir.txt";
  } else {
    url = "http://www.nbp.pl/kursy/xml/dir20" + req.params[0] + ".txt";
  }
  
  console.log("\nSzukamy daty w pliku: ", url);

  var getUrl = http.get(url, function(response){
      var xml = ''
    
      response.on('data', function(chunk) {
          xml += chunk;
      });

      response.on('end', function(){
          var rx = /a/g;
          var array;
          var sub = "";
          var search = req.params[0] + req.params[1] + req.params[2];
          var newUrl;
          var licznik=0;
    
          while((array = rx.exec(xml)) !== null){
              sub += xml.substring(array.index,array.index+11) + "\n";
          }
         

          newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);

          if(newUrl.length != 11){
            console.log("\nUrl o podanej dacie nie istnieje, szukamy najblizszej: ");
          }
          else{
            console.log("\nWyszukana data: ", newUrl);
          }

         if(req.params[1] == 1 && (req.params[2] == 1 || req.params[2] == 2 || req.params[2] == 3)){
              while(newUrl.length !=11 && licznik < 100){
                    search++;
                    temp2++;   
                    licznik++;
                    console.log("szukamy...",search);     
                    newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);
              }
          } else {
              while(newUrl.length !=11 && licznik < 100){
                    search--;
                    temp2--;   
                    licznik++;
                    console.log("szukamy...",search);     
                    newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);
              }
          }

            if(!rx.test(newUrl)){ 
                  newUrl = "a" + newUrl.substring(0,10); 
                  console.log(newUrl); 
            }

          if(temp2>=100){
              temp1++;
              temp2 = temp2 - 100;
            }

          if(temp2<=-70){
              temp1--;
              temp2 = temp2+100;
            }

          if(temp1.toString().length < 2){
            temp1 = '0' + temp1;
          }

          if(temp2.toString().length < 2){
            temp2 = '0' + temp2;
          }
  

  
          console.log("\nWyszukana data: ",newUrl);

          url = "http://www.nbp.pl/kursy/xml/" + newUrl + ".xml";
          console.log("\nCaly Url : ", url);

          if(licznik===100){         
              var request = http.get("http://www.nbp.pl/kursy/xml/a025z100205.xml", function(response) { 
                var xml = ''; 

                  response.on('data', function(chunk) { 
                     xml += chunk; 
                   });

                  response.on('end', function() {

                       parseString(xml, function (err, result) {
                          
                          result.tabela_kursow.pozycja.forEach(function(entry){
                              entryTab.push(entry.kod_waluty[0]);
                          }); 

                          draw1 = entryTab[rand(0,34)];
                          draw2 = entryTab[rand(0,34)];

                            res.render('calcMain', { 
                                  title: title,
                                  description: description,
                                  cash: result.tabela_kursow.pozycja,
                                  kurs: "", 
                                  selected1: req.params[3],
                                  selected2: req.params[4],
                                  amount: 1,
                                  year: req.params[0], 
                                  month: req.params[1],
                                  day: req.params[2],
                                  resultday: "",
                                  resultmonth: "",
                                  wynik:"",
                                  date: "",
                                  result_text: '',
                                  result: "Brak aktualizacji nbp z danego dnia, aktualizacje dokonywane są w dni robocze ok. godziny 12",
                                  result1: "show",
                                  result2: "hidden",
                                  contact: "hidden",
                                  draw1 : draw1,
                                  draw2 : draw2,
                                  rand_amount : rand(10,50),
                                  rand_year : rand(12,16),
                                  rand_month : '0'+ rand(1,5),
                                  rand_day : rand(10,30)
                            });    
                       });
                  });
              });
          }

          else{

            var request = http.get(url, function(response) { 
                var xml = ''; 

                  response.on('data', function(chunk) { 
                      xml += chunk; 
                  });

                  response.on('end', function() {

                        parseString(xml, function (err, result) {

                        result.tabela_kursow.pozycja.forEach(function(entry){
                              entryTab.push(entry.kod_waluty[0]);
                        });


                          draw1 = entryTab[rand(0,34)];
                          draw2 = entryTab[rand(0,34)];

                            if(step1 == "PLN"){
                                 step1 = step3 * pln;
                                 console.log("\nKrok1 = ilosc * waluta: ", step1, step3, pln);
                            } 
                            else { 
                               result.tabela_kursow.pozycja.forEach(function(entry) {
                                    if(step1 == entry.kod_waluty[0]){
                                    step1 = step3 * entry.kurs_sredni[0].replace(",",".");
                                    console.log("\nKrok1 = ilosc * waluta: ", step1, step3, entry.kod_waluty[0]);
                                    }   
                                }) 
                            }

                            if(step2 == "PLN"){
                                  step2 = step1 / pln;
                                  console.log("\nKrok2 = Krok1 / waluta: ", step2.toFixed(2), step1, pln);
                                  kurs = step2.toFixed(2);

                                   res.render('calcMain', { 
                                                title: title,
                                                description: description,
                                                cash: result.tabela_kursow.pozycja,
                                                kurs: kurs,
                                                selected1: req.params[3],
                                                selected2: req.params[4],
                                                amount: 1, 
                                                year: req.params[0], 
                                                month: req.params[1],
                                                day: req.params[2],
                                                resultday: temp2,
                                                resultmonth: temp1,
                                                wynik: "Przelicznik" + " " + req.params[3] + " na " + req.params[4],
                                                date: "Kurs nbp z dnia: " + req.params[0] + "-" + temp1 + "-" + temp2,
                                                result_text: result_text,
                                                result: 1 + " " + req.params[3] + " to " + kurs + ' ' + req.params[4],
                                                result1: "show",
                                                result2: "show",
                                                contact: "hidden",
                                                draw1 : draw1,
                                                draw2 : draw2,
                                                rand_amount : rand(10,50),
                                                rand_year : rand(12,16),
                                                rand_month : '0'+ rand(1,5),
                                                rand_day : rand(10,30)
                                            });
                            } else {
                                  result.tabela_kursow.pozycja.forEach(function(entry) {
                                      if(step2 == entry.kod_waluty[0]){
                                        step2 = step1 / entry.kurs_sredni[0].replace(",",".");
                                        console.log("\nKrok2 = Krok1 / waluta: ", step2.toFixed(2), step1, entry.kurs_sredni[0]);
                                        kurs = step2.toFixed(2);

                                            res.render('calcMain', { 
                                                title: title,
                                                description: description,
                                                cash: result.tabela_kursow.pozycja,
                                                kurs: kurs,
                                                selected1: req.params[3],
                                                selected2: req.params[4],
                                                amount: 1,
                                                year: req.params[0], 
                                                month: req.params[1],
                                                day: req.params[2],
                                                resultday: temp2,
                                                resultmonth: temp1,
                                                wynik: "Przelicznik" + " " + req.params[3] + " na " + req.params[4],
                                                date: "Kurs nbp z dnia: " + req.params[0] + "-" + temp1 + "-" + temp2,
                                                result_text: result_text,
                                                result: 1 + ' ' + req.params[3] + " to " + kurs + ' ' + req.params[4],
                                                result1: "show",
                                                result2: "show",
                                                contact: "hidden" ,
                                                draw1 : draw1,
                                                draw2 : draw2,
                                                rand_amount : rand(10,50),
                                                rand_year : rand(12,16),
                                                rand_month : '0'+ rand(1,5),
                                                rand_day : rand(10,30)
                                            });
                                      }
                                  }) 
                              }

                        });
                  });
            });
            }
        });
    });
});

router.get(/^\/przelicznik\/(\w+)\-na-(\w+)\-(\-*(\w*)\.*(\w*))\-(\w+)\-ile-to-(\w+)$/ , function(req,res) {

  var title = "Przelicznik" + " " + req.params[0] + " na " + req.params[1] + "." +  " " + req.params[0] + " ile to " + req.params[1];
  var description = title + " ? Sprawnie obliczysz to za pomocą kalkulatora EMoney. Obliczenia oparte o kursy NBP. Sprawdź";
  var result_text = "Drogi użytkowniku, nie wybrałeś daty. Jeśli nie chodziło ci o aktualny kurs proszę wybierz datę.";                    

  var step1 = req.params[0];
  var step2 = req.params[1];
  var step3 = req.params[2];
  var pln = 1;
  var url = "";
  var temp1 = currentMonth;
  var temp2 = currentDay;
  var entryTab = [];

  if(step3 === ''){
    step3 = 1;
    result_text = "Drogi użytkowniku, próbujesz przeliczyć walutę z " + req.params[0] + " na " + req.params[1]+"."+ 
                  " Niestety nie podałeś żadnej kwoty do przeliczenia:( Jeśli chcesz przeliczć inną wartość, niż 1 "+ 
                    req.params[0]+", na "+req.params[1] + ",wpisz ją proszę w pole wyszukiwania, obok pola oblicz. "+
                  "Nie zapomnij również o wyborze odpowiedniej daty. \n";                  
  }

  console.log("Pobrane parametry: \n", req.params);

  url = "http://www.nbp.pl/kursy/xml/dir.txt";
  
  console.log("\nSzukamy daty w pliku: ", url);

  var getUrl = http.get(url, function(response){
      var xml = ''
    
      response.on('data', function(chunk) {
          xml += chunk;
      });

      response.on('end', function(){
          var rx = /a/g;
          var array;
          var sub = "";
          var newUrl;
          var licznik=0;

          if(currentMonth.toString().length < 2){
              currentMonth = '0'+currentMonth;
          }

          if(currentDay.toString().length < 2){
              currentDay = '0' + currentDay;
          }
          
          var search = (currentYear-2000).toString() + currentMonth.toString() + currentDay.toString();

          while((array = rx.exec(xml)) !== null){
              sub += xml.substring(array.index,array.index+11) + "\n";
          }
         
          newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);

          if(newUrl.length != 11){
            console.log("\nUrl o podanej dacie nie istnieje, szukamy najblizszej: ");
          }
          else{
            console.log("\nWyszukana data: ", newUrl);
          }

            while(newUrl.length !=11 && licznik < 100){
                  search--;
                  temp2--;   
                  licznik++;
                  console.log("szukamy...",search);     
                  newUrl = sub.substring(sub.indexOf(search)-5,sub.indexOf(search)+6);
            }
          
          
            if(!rx.test(newUrl)){ 
                  newUrl = "a" + newUrl.substring(0,10); 
                  console.log(newUrl); 
            }

          if(temp1.toString().length < 2){
            temp1 = '0' + temp1;
          }

          if(temp2.toString().length < 2){
            temp2 = '0' + temp2;
          }
  

          if(currentMonth.toString().length < 2){
            currentMonth = '0' + currentMonth;
          }
          
          if(currentDay.toString().length < 2){
            currentDay = '0' + currentDay;
          }
  
  
          console.log("\nWyszukana data: ",newUrl);

          url = "http://www.nbp.pl/kursy/xml/" + newUrl + ".xml";
          console.log("\nCaly Url : ", url);

            var request = http.get(url, function(response) { 
                var xml = ''; 

                  response.on('data', function(chunk) { 
                      xml += chunk; 
                  });

                  response.on('end', function() {

                        parseString(xml, function (err, result) {

                        result.tabela_kursow.pozycja.forEach(function(entry){
                              entryTab.push(entry.kod_waluty[0]);
                        });


                          draw1 = entryTab[rand(0,34)];
                          draw2 = entryTab[rand(0,34)];

                            if(step1 == "PLN"){
                                 step1 = step3 * pln;
                                 console.log("\nKrok1 = ilosc * waluta: ", step1, step3, pln);
                            } 
                            else { 
                               result.tabela_kursow.pozycja.forEach(function(entry) {
                                    if(step1 == entry.kod_waluty[0]){
                                    step1 = step3 * entry.kurs_sredni[0].replace(",",".");
                                    console.log("\nKrok1 = ilosc * waluta: ", step1, step3, entry.kod_waluty[0]);
                                    }   
                                }) 
                            }

                            if(step2 == "PLN"){
                                  step2 = step1 / pln;
                                  console.log("\nKrok2 = Krok1 / waluta: ", step2.toFixed(2), step1, pln);
                                  kurs = step2.toFixed(2);

                                   res.render('calcMain', { 
                                                title: title,
                                                description: description,
                                                cash: result.tabela_kursow.pozycja,
                                                kurs: kurs,
                                                selected1: req.params[0],
                                                selected2: req.params[1],
                                                amount: req.params[2], 
                                                year: '', 
                                                month: '',
                                                day: '',
                                                resultday: temp2,
                                                resultmonth: temp1,
                                                wynik: "Przelicznik" + " " + req.params[0] + " na " + req.params[1],
                                                date: "Kurs nbp z dnia: " + currentYear + "-" + temp1 + "-" + temp2,
                                                result_text: result_text,
                                                result:step3 + ' ' + req.params[0] + " to " + kurs + ' ' + req.params[1],
                                                result1: "show",
                                                result2: "show",
                                                contact: "hidden",
                                                draw1 : draw1,
                                                draw2 : draw2,
                                                rand_amount : rand(10,50),
                                                rand_year : rand(12,16),
                                                rand_month : '0'+ rand(1,5),
                                                rand_day : rand(10,30)
                                            });
                            } else {
                                  result.tabela_kursow.pozycja.forEach(function(entry) {
                                      if(step2 == entry.kod_waluty[0]){
                                        step2 = step1 / entry.kurs_sredni[0].replace(",",".");
                                        console.log("\nKrok2 = Krok1 / waluta: ", step2.toFixed(2), step1, entry.kurs_sredni[0]);
                                        kurs = step2.toFixed(2);

                                            res.render('calcMain', { 
                                                title: title,
                                                description: description,
                                                cash: result.tabela_kursow.pozycja,
                                                kurs: kurs,
                                                selected1: req.params[0],
                                                selected2: req.params[1],
                                                amount: req.params[2],
                                                year: '', 
                                                month: '',
                                                day: '',
                                                resultday: temp2,
                                                resultmonth: temp1,
                                                wynik: "Przelicznik" + " " + req.params[0] + " na " + req.params[1],
                                                date: "Kurs nbp z dnia: " + currentYear + "-" + temp1 + "-" + temp2,
                                                result_text: result_text,
                                                result: step3 + ' ' + req.params[0] + " to " + kurs + ' ' + req.params[1],
                                                result1: "show",
                                                result2: "show",
                                                contact: "hidden" ,
                                                draw1 : draw1,
                                                draw2 : draw2,
                                                rand_amount : rand(10,50),
                                                rand_year : rand(12,16),
                                                rand_month : '0'+ rand(1,5),
                                                rand_day : rand(10,30)
                                            });
                                      }
                                  }) 
                              }

                        });
                  });
            });
        });
    });
});
                  
router.get(/^\/((\w+)\-*(\w*)\.*\-*(\w*))$/, function(req,res){

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
  check.push(req.params[0].replace(/-/g, ' '));

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
            var p = new Produkt(i,products_subcategory[i],products_name[i],products_provider[i],products_logo[i],products_prez[i],products_application[i],products_description[i]);
            product_table.push(p);
        }

  
        // console.log(product_table);

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

