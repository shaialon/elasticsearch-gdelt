"use strict";

const columns = require('./columns'),
      quadclass_names = require('./quadclass_names'),
      eventrootcode_names = require('./eventrootcode_names'),
      eventcode_names = require('./eventcode_names'),
      _  = require ('lodash');

const cameoToHuman = {
    'QuadClass' : quadclass_names,
    'EventRootCode': eventrootcode_names,
    'EventCode' : eventcode_names,
    'EventBaseCode' :eventcode_names
};

const discardedFields = new Set([
    'FractionDate', 'SQLDATE', 'MonthYear', 'Year'
]);


const formatter = function(record){
    let newRecord = {};
    record.forEach((columnValue, index) => {
        if(columnValue.length>0){ // Only index actual values to save overhead.
            let action = columns[index];

            if(discardedFields.has(action)){
                // This field is discarded from the object going forward (to save overhead)
            }
            else if(cameoToHuman[action]){
                // Turns CAMEO codes into human readable strings
                newRecord[action] = cameoToHuman[action][columnValue] || columnValue;
            }
            else if (_.startsWith(action ,'Num') || _.startsWith(action ,'Avg') || action === 'GoldsteinScale'){
                // Turns numbers from strings to actual numbers that can be evaluated , sorted , aggregated...
                newRecord[action]=Number(columnValue);
            }
            else {
                // Default : just the string value
                newRecord[action] = columnValue;
            }
        }
    });
    return JSON.stringify(newRecord)+'\n';
}

module.exports = formatter;
