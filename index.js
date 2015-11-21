"use strict";

// External dependencies
const fs = require('fs'),
      _  = require ('lodash'),
      transform = require('stream-transform'),
      parse = require('csv-parse');


const indexName = '20151028';

const input = fs.createReadStream(__dirname+'/samples/'+indexName+'.export.CSV');
const parser = parse({delimiter: '\t'});

input.pipe(process.stdout);

