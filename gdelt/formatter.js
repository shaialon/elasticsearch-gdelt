"use strict";

const columns = require('./columns'),
      quadclass_names = require('./quadclass_names'),
      eventrootcode_names = require('./eventrootcode_names'),
      eventcode_names = require('./eventcode_names'),
        rootEventNames = {"0":"No","1":"Yes"},
      _  = require ('lodash');

const cameoToHuman = {
    'QuadClass' : quadclass_names,
    'EventRootCode': eventrootcode_names,
    'EventCode' : eventcode_names,
    'EventBaseCode' :eventcode_names,
    'IsRootEvent' : rootEventNames
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
                // The field is discarded from the object going forward (to save overhead)
            }
            else if(cameoToHuman[action]){
                // Turns CAMEO codes into human readable strings
                newRecord[action] = cameoToHuman[action][columnValue] || columnValue;
            }
            else if (_.startsWith(action ,'Num') || _.startsWith(action ,'Avg') || action === 'GoldsteinScale'){
                // Turns numbers from strings to actual numbers that can be evaluated , sorted , aggregated...
                newRecord[action]=Number(columnValue);
            }
            else if(_.endsWith(action ,'Geo_FullName')){
                // Transform "Petersburg, Sankt-Peterburg, Russia" into ["Petersburg", "Sankt-Peterburg", "Russia"] for easy evaluation in index
                newRecord[action]=columnValue.split(", ");
            }
            else if(_.endsWith(action ,'Geo_Lat') || _.endsWith(action ,'Geo_Long')){
                // Transform "Actor1Geo_Long":"70", "Actor1Geo_Lat":"30" into elastichsearch geo points Actor1Geo_Location = {lat:30,lon:70}
                let newAction = `${action.split('_')[0]}_Location`;
                if(!newRecord[newAction]){newRecord[newAction] = {};}
                newRecord[newAction][action.substr(10,3).toLowerCase()] = Number(columnValue);
            }
            else if (action === 'DATEADDED'){
                // Transform Date into elasticsearch format
                newRecord[action]=`${columnValue.substr(0,4)}-${columnValue.substr(4,2)}-${columnValue.substr(6,2)}`;
            }
            else {
                // Default : just the string value
                newRecord[action] = columnValue;
            }
        }
    });
    return newRecord;
}

module.exports = formatter;
