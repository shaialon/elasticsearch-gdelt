"use strict";
const elasticsearch = require('elasticsearch');

const sendThreshhold = 500;
const timerThreshold = 10000;

class esIndexer {
    constructor(options) {
        var that = this;
        this.client = new elasticsearch.Client({
            host: 'http://localhost:9200',
            //log: 'trace'
        });
        this._index = options._index;
        this._type = options._type;
        this._mapping = options._mapping;
        this._action = { index:  { _index: this._index, _type: this._type} };
        this._batches = [];
        this._newbatch();
        this._lastBatchSend = Date.now();

        this.scheduler = setInterval(function () {
            if(that._queueLength() > 0  && ( (Date.now()-that._lastBatchSend) > timerThreshold ) ){
                console.log("Timer - send now");
                that._sendBatch();
            }
        }, timerThreshold);

    }

    _newbatch(){
        this._batches.push({
            bulkData: [],
            callbacks: [],
        });
    }

    _sendBatch(){
        var batch = this._batches.pop();
        this._lastBatchSend = Date.now();
        this.client.bulk({
            body: batch.bulkData
        }, function (err, resp) {
            if(err || !resp || !resp.items || resp.items.length !== batch.callbacks.length) {
                console.error(err);
                batch.callbacks.forEach((callback)=>{
                    if(callback){
                        callback(err,'failed to index\n');
                    }
                });
            }
            let successFull = 0, failed =0, summary = `Batch of ${batch.callbacks.length} docs done.`;
            let items = resp.items;
            batch.callbacks.forEach((callback, index)=>{
                if(callback){
                    if(items[index].create.status === 201){
                        callback(err,"");
                        successFull++;
                    }
                    else {
                        //callback(err,"");
                        callback(err,`Indexing failure ${JSON.stringify(items[index])}\n`);
                        failed++;
                    }
                }
            });
            if(successFull>0){
                summary+= ` Successful: ${successFull}`;
            }
            if(failed>0){
                summary+= ` Failed: ${failed}`;
            }
            console.log(summary);

            batch = null; // v8 memory clear.
        });
        this._newbatch();
    }

    _queueLength(){
        return this._batches[this._batches.length-1].callbacks.length;
    }

    //validateIndex(callback) {
    //    var that = this;
    //    this.client.indices.exists({index: that._index},function(err, exists){
    //        if(err){
    //            console.log("quit...");
    //            return;
    //        }
    //        if(!exists){
    //            console.info('This is the first run. Create the index');
    //            that.client.indices.create({index: that._index, body:{mappings:that._mappings}},function(err, indexCreated){
    //                console.info(JSON.stringify(indexCreated));
    //                callback();
    //            });
    //        }
    //        else {
    //            console.log("INDEX EXISTS");
    //            // TODO: update mapping
    //            callback();
    //        }
    //    });
    //}
    indexDoc(data,callback) {
        this._batches[this._batches.length-1].bulkData.push(this._action,data);
        this._batches[this._batches.length-1].callbacks.push(callback);
        if(this._queueLength() >=  sendThreshhold){
            this._sendBatch();
        }
    }
};

module.exports = esIndexer;
