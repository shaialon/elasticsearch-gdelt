"use strict";

const columns = require('./columns'),
      quadclass_names = require('./quadclass_names'),
        eventrootcode_names = require('./eventrootcode_names'),
    eventcode_names = require('./eventcode_names'),
      _  = require ('lodash');

const NameAdders = {
    'QuadClass' : quadclass_names,
    'EventRootCode': eventrootcode_names,
    'EventCode' : eventcode_names,
    'EventBaseCode' :eventcode_names
};

const formatter = function(record){
    let newRecord = {};
    record.forEach((columnValue, index) => {
        if(columnValue.length>0){ // Only index actual values to save overhead.
            let action = columns[index];

            if(NameAdders[action]){
                newRecord[action] = NameAdders[action][columnValue] || columnValue;
            }
            else {
                newRecord[action] = columnValue;
            }
        }
    });
    return JSON.stringify(newRecord)+'\n';
}

module.exports = formatter;
