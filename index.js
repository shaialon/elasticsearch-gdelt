"use strict";

// External dependencies
const fs = require('fs'),
      _  = require ('lodash'),
      transform = require('stream-transform'),
      parse = require('csv-parse'),
      formatter = require('./gdelt/formatter');


const indexName = '20151028';

const input = fs.createReadStream(__dirname+'/samples/'+indexName+'.export.CSV');



const parser = parse({delimiter: '\t'})
const transformer = transform(function(record, callback){
        callback(null, formatter(record));
}, {parallel: 1});

input.pipe(parser)
     .pipe(transformer)
     .pipe(process.stdout);



