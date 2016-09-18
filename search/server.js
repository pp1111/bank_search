var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var autocomplete = require('./lib/autocomplete');


var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.get('/autocomplete/:search',autocomplete.find);

app.listen(4000, cb => {
	console.log('app listen on port: 4000')
});
