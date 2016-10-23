'use strict'

const q = require('q');
 
const arf = require('../../lib/arf');
const getContent = require('../../lib/getContent');

const express = require('express');
const router = express.Router();
const solrClient = require('../solr_scripts/solr-client');

const ascii = require('../../lib/ascii');

let solr = new solrClient({ bigint : true });

module.exports = () => {
    router.get('/search/data', search.get);
    router.get('/search/suggestions', search.suggestions);
    return router;
}
 
let search = {
    get: (req, res, next) => q.async(function* () {
        let query = req.query.q;
        query = ascii.toUTF8(query); // encode
        query = escapeRegExp(query); // escape brackets
        query = escape(query); // escape special chars
        console.log(query);
        let result = yield getContent('http://localhost:8983/solr/core0/select?wt=json&indent=on&q=value:' + query, false);
        result = JSON.parse(result);
        return arf.response(res, result, 200);  
    })().catch(next).done(),
    suggestions: (req, res, next) => q.async(function* () {
        let result = yield getContent('http://localhost:8983/solr/core0/suggesthandler?rows=5&wt=json&indent=on&q=' + req.query.q, false);
        result = JSON.parse(result);
        let suggestions = result.suggest.mySuggester[req.query.q].suggestions
        res.jsonp(suggestions);
    })().catch(next).done(),
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}