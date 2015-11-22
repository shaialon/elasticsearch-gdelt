"use strict";

// External dependencies
const fs = require('fs'),
      transform = require('stream-transform'),
      parse = require('csv-parse'),
      gdelt_formatter = require('./gdelt/formatter.js'),
      esIndexer = require('./es.js'),
      concurrency = 10000;



const indexName = '20151028';
const input = fs.createReadStream(__dirname+'/samples/'+indexName+'.export.CSV');

const indexer = new esIndexer({_index: 'elastic_gdelt', _type: 'event'});
const parser = parse({delimiter: '\t'});


const formatter = transform(function(record, callback){
        callback(null, gdelt_formatter(record));
}, {parallel: concurrency});

const elastic_indexer = transform(function(record, callback){
    indexer.indexDoc(record,callback);
}, {parallel: concurrency});

input.on('end', () => {
    console.log("Finished reading CSV file.");
    //  TODO: finish indexing handler...
});

input.pipe(parser)
     .pipe(formatter)
     .pipe(elastic_indexer)
     .pipe(process.stdout);



