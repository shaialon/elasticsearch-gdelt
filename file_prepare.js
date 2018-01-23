const indexer = require('./indexer');

const dateToFetch= '20180121';
const ZIP_DIR = `./samples`;

const AdmZip = require('adm-zip'),
        http = require('http'),
        fs = require('fs');


const url = `http://data.gdeltproject.org/events/${dateToFetch}.export.CSV.zip`,
     zipName = `./${ZIP_DIR}/${dateToFetch}.export.CSV.zip`;

function unzipFile(){
    const zip = new AdmZip(zipName);
    console.log("Start Decompressing Zip!");
    zip.extractAllTo(ZIP_DIR, true);

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

download(url,zipName,afterDownload);

function afterDownload(err,res){
  unzipFile(); // Blocking
  indexer.indexGdeltFile();
}




