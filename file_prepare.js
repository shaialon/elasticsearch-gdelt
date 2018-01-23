"use strict";

const dateToFetch= '20180122';
const ZIP_DIR = `./zips`;

const AdmZip = require('adm-zip'),
        http = require('http'),
        fs = require('fs');


const url = `http://data.gdeltproject.org/events/${dateToFetch}.export.CSV.zip`,
     zipName = `./${ZIP_DIR}/${dateToFetch}.export.CSV.zip`;

const unzipFile = function(){
    var zip = new AdmZip(zipName);
    zip.extractAllTo("./zips", true);

    fs.unlink(zipName, function(err){
        if (err) throw err;
        console.log("Done Decompressing Zip!");
    });
}

const download = function(url, dest, cb) {
      if (!fs.existsSync(ZIP_DIR)){
        fs.mkdirSync(ZIP_DIR);
      }

    var file = fs.createWriteStream(dest);

    console.log("START DOWNLOADING "+url);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            console.log("DONE DOWNLOADING "+url);
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
});
};

download(url,zipName,unzipFile);



