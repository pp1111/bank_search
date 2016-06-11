var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    http = require('http'),
    iconv = require('iconv'),
    parseString = require('xml2js').parseString;

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

 function Produkt(b,c,d,e,f,g,h){
    this.category = b;
    this.name = c;
    this.provider = d;
    this.logo = e;
    this.prez = f;
    this.application = g;
    this.description = h;
 }

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
  var product_table = [];


MongoClient.connect('mongodb://localhost:27017/products', function(err, db) {

var col =  db.collection("productsList");

	assert.equal(null, err);
	console.log("connected to db");

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
	        });
        
	        for(var i=0;i<products_name.length;i++){
	            var p = new Produkt(products_subcategory[i],products_name[i],products_provider[i],products_logo[i],products_prez[i],products_application[i],products_description[i]);
	            product_table.push(p);
	        }

        
	       col.insertMany(product_table,function(err,r){
	       		 assert.equal(null, err);
	     		 console.log("inserted documents: " ,r.insertedCount);
	       });

	       col.find({"category" : "Karty kredytowe"}).limit(2).toArray(function(err, docs) {
	       		console.log(docs);
		    });


	     	db.close(function(){
	       		console.log("Drop database connection");
	        });
	       var query = {};

     

      });
    });
  });
});