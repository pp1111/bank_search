#!/bin/sh

/opt/node/bin/node /opt/bank_search/db_scripts/db.js
sleep 5
/opt/node/bin/node /opt/bank_search/search/solr_scripts/populate.js
