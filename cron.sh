#!/bin/sh

node /home/patryk/projects/bank_search/db_scripts/db.js
sleep 5
node /home/patryk/projects/bank_search/search/solr_scripts/populate.js