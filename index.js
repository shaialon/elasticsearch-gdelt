"use strict";

// External dependencies
const fs = require('fs'),
      transform = require('stream-transform'),
      parse = require('csv-parse'),
      formatter = require('./gdelt/formatter.js'),
      esIndexer = require('./es.js'),
      concurrency = 5000;



const indexName = '20151028';
const input = fs.createReadStream(__dirname+'/samples/'+indexName+'.export.CSV');

const indexer = new esIndexer({_index: 'elastic_gdelt', _type: 'event'});
const parser = parse({delimiter: '\t'});


const transformer = transform(function(record, callback){
        callback(null, formatter(record));
}, {parallel: concurrency});

const elastic_indexer = transform(function(record, callback){
    indexer.indexDoc(record,callback);
}, {parallel: concurrency});

input.pipe(parser)
     .pipe(transformer)
     .pipe(elastic_indexer)
     .pipe(process.stdout);



