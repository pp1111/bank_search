'use strict';
 
const q = require('q');
const fs = require('fs');
 
var http = require('http');
var solr = require('solr-client');
var xmldoc = require('xmldoc');
 
module.exports = class SolrClient {
    constructor (opts) {
        this.client = solr.createClient('localhost', '8983', 'core0', http.agent);
        this.schema = readSchema(`/Users/pepe/solr-5.0.0/server/solr/core0/conf/schema.xml`);
    }
 
    query () {
        return this.client.createQuery();
    }
 
    executeQuery (query) {
        return q.ninvoke(this.client, 'search', query)
            .catch(err => console.log(err))
    }
    
    add (document) {
        return q.ninvoke(this.client, 'add', document)
            .catch(err => console.log(err))
    }

    update (documents) {
        return q.ninvoke(this.client, 'update', documents);
    }
 
    delete () {
        const solrCommand = {
            delete: {
                query: `*:*`,
            },
        };
 
        return q.ninvoke(this.client, 'update', solrCommand);
    }
 
    deleteProduct (id) {
        const solrCommand = {
            delete: {
                query: `_id: ${id}`,
            },
        };
 
        return q.ninvoke(this.client, 'update', solrCommand);
    }
 

};
 
 
function readSchema (schemaFilepath) {
    const xml = fs.readFileSync(schemaFilepath);
    const schema = new xmldoc.XmlDocument(xml);
 
    return schema.childrenNamed('field')
        .map(field => field.attr)
        .filter(field => (field.name !== '_version_' && field.name !== '_root_'))
        .map(field => {
            field.type = field.type === 'text_value' ? 'string' : field.type;
 
            delete field.indexed;
            delete field.stored;
            delete field.multiValued;
            return field;
        });
}
 
function boostProducts (data, friends) {
    const magnitudes = data.map(row => {
        const isFriend = friends.indexOf(row.owner) !== -1;
        return {
            url: row.url,
            weight: isFriend ? 0.5 : 0,
        };
    });
 
    return boosts.boostScore(data, magnitudes);
}
