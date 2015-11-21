"use strict";

const columns = require('./columns');

const formatter = function(record){
    let newRecord = {};
    record.forEach((columnValue, index) => {
        let action = columns[index];
        newRecord[action] = columnValue;
    });
    return JSON.stringify(newRecord)+'\n';
}

module.exports = formatter;
