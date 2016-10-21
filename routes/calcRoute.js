var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require('http');
var request = require('request');
var url = require('url');


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

router.get('/', function (req, res) {

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


router.get(/^\/(\w+)\-(\w+)\-(\w+)\/(\w+)\-na-(\w+)\-(\-*(\w+)\.*(\w*))\-(\w+)\-ile-to-(\w+)$/ , function(req,res) {
 

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


router.get(/^\/(\w+)\-(\w+)\-(\w+)\/(\w+)\-na-(\w+)\-\-(\w+)\-ile-to-(\w+)$/ , function(req,res) {

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

router.get(/^\/(\w+)\-na-(\w+)\-(\-*(\w*)\.*(\w*))\-(\w+)\-ile-to-(\w+)$/ , function(req,res) {

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

module.exports = router;