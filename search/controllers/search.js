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
    router.get('/search/cms', search.cms);
    return router;
}
 
let search = {
    get: (req, res, next) => q.async(function* () {
        let query = req.query.q;
        query = encodeURIComponent(query);
        let result = yield getContent('http://amoney.pl:8983/solr/core0/select?wt=json&indent=on&fq=alive:true&q=value:' + query, false);
        result = JSON.parse(result);
        res.jsonp(result);
    })().catch(next).done(),
    cms: (req, res, next) => q.async(function* () {
        let query = req.query.q;
        query = encodeURIComponent(query);
        let result = yield getContent('http://amoney.pl:8983/solr/core0/select?wt=json&indent=on&q=value:' + query, false);
        result = JSON.parse(result);
        res.jsonp(result);
    })().catch(next).done(),
}
    
