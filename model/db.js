const MongoClient = require('mongodb').MongoClient,
    http = require('http'),
    iconv = require('iconv'),
    parseString = require('xml2js').parseString;

function product (c,s,n,p,l,pr,a,d) {
	this.category = c;
	this.subcategory = s;
	this.name = n;
	this.provider = p;
	this.logo = l;
	this.prez = pr;
	this.application = a;
	this.description = d;
}

const productList = [];

module.exports = function productList () {
	MongoClient.connect('mongodb://localhost:27017/products').then( db => {
		console.log('connected to db');
		var collection = db.collection("productsList");

		getContent("http://api.systempartnerski.pl/2.0/xml/yU8P2f9BtaN8V8OKj58/").then( xml => {
			parseString(xml, (err,result) => {
				result.oferta.kategoria.forEach( kategoria => {
					kategoria.podkategoria.forEach( podkategoria => {
						podkategoria.produkt.forEach( produkt => {
							p = new product(
								kategoria.$.nazwa,
								asciiOff(podkategoria.$.nazwa),
								produkt.$.nazwa,
								produkt.dostawca[0].$.nazwa,
								produkt.dostawca[0].$['logo-male'],
								produkt.linki[0].$.prezentacja,
								`http://uki222.systempartnerski.pl${produkt.linki[0].$.wniosek}`,
								produkt.opis[0]
							)
							productList.push(p)
						})
					})
				})
			})
		}).then( () => {
			return products;
		})
	})
}
const getContent = function(url) {
  	return new Promise((resolve, reject) => {
    	const lib = url.startsWith('https') ? require('https') : require('http');
    	const request = lib.get(url, (response) => {
	      	if (response.statusCode < 200 || response.statusCode > 299) {
	        	reject(new Error('Failed to load page, status code: ' + response.statusCode));
	        }
		      let body = '';
		      response.on('data', (chunk) => body += toUTF8(chunk));
		      response.on('end', () => resolve(body));
	    });
	    request.on('error', (err) => reject(err))
    })
};

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