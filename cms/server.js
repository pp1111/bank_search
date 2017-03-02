var express = require('express');
var product = require('./routes/product');
var logger = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
app.use(express.static(__dirname + '/controllers'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use( (req,res,next) => {
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	next();
})

app.use(function(req, res, next) {
    var auth; 
    if (req.headers.authorization) {
      auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }

    if (!auth || auth[0] !== 'user' || auth[1] !== 'Real2121') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
    } else {
        next();
    }
});

app.get('/', function(req, res) {
    res.sendfile('./views/main.html');
});

app.get('/selected/:id', (req,res) => {
    res.sendfile('./views/cms.html');
});

app.get('/products', product.findAll);
app.get('/products/:id', product.findById);
app.post('/products', product.addproduct);
app.put('/products/:id', product.updateproduct);
app.delete('/products/:id', product.deleteproduct);

app.listen(5000);
console.log('Listening on port 5000...');
