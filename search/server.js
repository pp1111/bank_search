const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const controllers = require('./controllers/search');

app.use(logger('dev'));
app.use(bodyParser.json());
app.get('/search/:result', controllers());

app.listen(4000, cb => {	
	console.log('app listen on port: 4000')
});
