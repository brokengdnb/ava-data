// DEPENDICIES
const fs = require('fs');
const request = require('request');
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressOasGenerator = require("express-oas-generator");
const fileUpload = require('express-fileupload');
//const multer = require('multer');

var opn = require('opn');

//opload

var multer  = require('multer'),
    upload  = multer({ dest: __dirname + '/uploads' });



// CONFIG
const dbConfig = require("./config/database.config.js");

var youtubedl = require('youtube-dl');

var ffmpeg = require('fluent-ffmpeg');
var stream = require('express-stream');
var ffmetadata = require("ffmetadata");
const sharp = require('sharp');



var outStream;



// SET A WEB SERVER
const app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    geoip = require('geoip-lite');
const moveImportedSongfs = require("mongodb");

// SET PUG template rendering
app.set('view engine', 'pug');

// SET public and upload folder for backup/restore
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, 'upload')));
app.use("/import", express.static(path.join(__dirname, 'import')));
app.use("/export", express.static(path.join(__dirname, 'export')));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

//SET MULTER
//app.use(multer());

// SET FILE UPLOADER
app.use(fileUpload());


var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};



// ROUTES
require("./app/routes/note.routes.js")(app);
require("./app/routes/backup.routes.js")(app);
require("./app/routes/playlists.routes.js")(app);
require("./app/routes/effects.routes.js")(app);
require("./app/routes/favourite.routes.js")(app);
require("./app/routes/movie.routes.js")(app);
require("./app/routes/song.routes.js")(app);

// define a default ROUTE to redirect to API-DOC
app.get("/", (req, res) => {
   res.render(
            'index',
            {
                appName: "AVA Data",
                appVersion: "f",
            });
});


app.post('/uploadImageForSong.html', function(request, response) {
    if( Object.prototype.toString.call( request.files.file ) === '[object Array]' ) {
        request.files.file.forEach(function(entry) {
            fs.writeFile(path.join(__dirname, 'import/tn.png'), entry.data, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        });

        response.status(200).send(JSON.stringify({ success: true, fileCount: request.files.file }));
    } else {
        fs.writeFile(path.join(__dirname, 'import/tn.png'), request.files.file.data, function(err) {
            if(err) {
                return console.log(err);
            }
        });

        response.status(200).send(JSON.stringify({ success: true, fileCount: request.files.file }));
    }
});


// Responsible for handling the file upload.
app.post('/upload.html', function(request, response) {
    if( Object.prototype.toString.call( request.files.file ) === '[object Array]' ) {
        request.files.file.forEach(function(entry) {
            fs.writeFile(path.join(__dirname, 'upload/local/') + decodeURI(entry.name), entry.data, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        });

        response.status(200).send(JSON.stringify({ success: true, fileCount: request.files.file }));
    } else {
        fs.writeFile(path.join(__dirname, 'upload/local/') + decodeURI(request.files.file.name), request.files.file.data, function(err) {
            if(err) {
                return console.log(err);
            }
        });

        response.status(200).send(JSON.stringify({ success: true, fileCount: request.files.file }));
    }
});



// RENDER ALL COLLECTIONS IN DATABASE
app.get("/schema", (req, res) => {
    if(!req.query.collections) {
        return res.status(404).send()
    } else {
        var Schema = mongoose.model(req.query.collections).schema;
        res.status(200);
        res.send(Schema);
        res.end();
    }
});

var YTFFactive = false;
io.sockets.emit('YTFFactive', false);

app.get('/csv', function(req, res) {
    const csvFilePath = path.join(__dirname, 'import/' + req.query.path);
    const csv = require('csvtojson')

    csv()
        .fromFile(csvFilePath)
        .then((jsonObj)=>{
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ files: jsonObj }));
            res.end();
        })
});

app.get('/ytimg', function(req, res) {
    if(req.query.id) {
        const url = 'https://www.youtube.com/watch?v=' + req.query.id;

        const options = {
            // Downloads available thumbnail.
            all: false,
            // The directory to save the downloaded files in.
            cwd: path.join(__dirname, 'ytdl/'),
        };

        fs.unlink(path.join(__dirname, 'upload/temp.jpg'),function(error){
            if(error) return console.log(error);
            var random = (new Date()).toString();

            console.log(req.query.id);

            download('https://i.ytimg.com/vi/' + req.query.id + '/sddefault.jpg' + "?cb=" + random, path.join(__dirname, 'ytdl/down.jpg'), function(){

                sharp(path.join(__dirname, 'ytdl/down.jpg'))
                    .resize(200)
                    .toFile(path.join(__dirname, 'upload/temp.jpg'), (errr, info) => {
                        if (errr) console.error('image processing: ' + errr);


                                res.status(200);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify({ file: 'upload/temp.jpg' }));
                                res.end();

                    });
            });
        });



    } else {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ file: "NOT-FOUND" }));
        res.end();
    }


});



app.get('/getMovieInfo', function(req, res) {
    ffmpeg({ source: path.join(__dirname, 'import/' + req.query.path), nolog: true })
        .takeScreenshots({ timemarks: [ req.query.time ] }, path.join(__dirname, 'import/'), function(err, filenames) {

        });


    ffmpeg.ffprobe({ source: path.join(__dirname, 'import/' + req.query.path)}, function(err, infoo){
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ path: req.query.path, info: infoo }));

        res.end();
    });
});

app.get('/getMoveInfo', function(req, res) {
    const mm = require('music-metadata');
    const extension = path.extname(path.join(__dirname, 'upload/local/' + req.query.path));

    if(extension === ".mp3"
        || extension === ".flac"
        || extension === ".webm"
        || extension === ".acc"
        || extension === ".m4a"
        || extension === ".wav") {

        mm.parseFile(path.join(__dirname, 'upload/move/' + req.query.path))
            .then( metadata => {
                if(typeof metadata.common.picture != "undefined") {
                    fs.writeFile(path.join(__dirname, 'upload/move/tn.png'), metadata.common.picture[0].data, 'base64', function(err) {
                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ path: req.query.path }));

                        res.end();

                    });
                } else {

                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ path: "no image?" }));

                    res.end();
                }
            })
            .catch( err => {
                console.error(err.message);
            });


    } else {
        ffmpeg({ source: path.join(__dirname, 'upload/move/' + req.query.path), nolog: true })
            .takeScreenshots({ timemarks: [ '00:00:02.000' ], size: '1270x720' }, path.join(__dirname, 'upload/move/'), function(err, filenames) {

            });

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ path: req.query.path }));

        res.end();
    }
});


app.post('/moveCsvImg', function(req, res) {

    for(let i = 0; i < req.body.data.data.length; i++) {

        sharp(req.body.data.data[i].path + '.png')
            .resize(150)
            .toFile(path.join(__dirname, 'export/imgs/' + req.body.data.data[i]._id + '.png'), (errr, info) => {
                if (errr) console.error('image processing: ' + errr);

            });

        if(i === (req.body.data.data.length - 1)){
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({data: req.body.data.data}))

            res.end();
        }
    }



});

app.post('/getImportedCSV', function(req, res) {
    const mm = require('music-metadata');
const redColor = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADMCAYAAAA/IkzyAAAEdklEQVR4Xu3TsQ0AMAgEMdh/6ETKBLne1F9Z3J6ZM44AgS+BFcyXkxGBJyAYj0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKQHB+AECQUAwAcuUgGD8AIEgIJiAZUpAMH6AQBAQTMAyJSAYP0AgCAgmYJkSEIwfIBAEBBOwTAkIxg8QCAKCCVimBATjBwgEAcEELFMCgvEDBIKAYAKWKYELAVmXRCoVZTkAAAAASUVORK5CYII=";
    var redColorBase64Data = redColor.replace(/^data:image\/png;base64,/, "");

    for(let i = 0; i < req.body.data.length; i++) {



        ffmpeg.ffprobe({ source: req.body.data[i].Location}, function(err, infoo){
            //listData.push({ffmpeg: infoo})

            mm.parseFile(infoo.format.filename)
                .then( meta => {
                    //listData.push({meta: meta});
                    if(typeof meta.common.picture != "undefined") {
                        fs.writeFile(infoo.format.filename + '.png', meta.common.picture[0].data, 'base64', function(err) {
                            // wow
                        });
                    } else {
                        console.log("creating RED for - " + infoo.format.filename + '.png');

                        fs.writeFile(infoo.format.filename + '.png', redColorBase64Data, 'base64', function(errr) {
                            if(errr) {
                                return console.log(errr);
                            }
                        });
                    }
                })
                .catch( err => {
                    console.error(err.message);
                });

            if(i === (req.body.data.length - 1)){
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(req.body.data));

                res.end();
            }
        });
    }



    /*mm.parseFile(path.join(__dirname, 'import/' + req.body.data.path))
        .then( meta => {
            const fileSizeInBytes = fs.statSync(path.join(__dirname, 'import/') + req.query.path).size;
            if(typeof meta.common.picture != "undefined") {
                fs.writeFile(path.join(__dirname, 'import/tn.png'), meta.common.picture[0].data, 'base64', function(err) {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ path: "ok", data: meta, size: fileSizeInBytes, path: req.query.path }));

                    res.end();
                });
            } else {

                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ path: "nope", data: meta, size: fileSizeInBytes, path: req.query.path }));

                res.end();
            }
        })
        .catch( err => {
            console.error(err.message);
        });*/
})

app.post('/removeImportedSong', function(req, res) {
    fs.unlink(path.join(__dirname, 'import/' + req.body.data.path),function(error) {
        if (error) return console.log(error);

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ local: 'ok' }));
        res.end();
    });
})

app.post('/removeSongAndImg', function(req, res) {
    fs.unlink(path.join(__dirname, 'export/imgs/' + req.body.data + '.png'),function(error) {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ local: 'ok' }));
        res.end();
    });
})

app.post('/moveImportedSong', function(req, res) {
    fs.rename(path.join(__dirname, 'import/output.mp3'), path.join(__dirname, 'export/songs/' + req.body.data._id + '.mp3'), function(renameError) {
        if ( renameError ) console.error('rename: ' + renameError);

        fs.rename(path.join(__dirname, 'import/tn.png'), path.join(__dirname, 'export/imgs/' + req.body.data._id + '.png'), function(renameImgError) {
            if ( renameError ) console.error('rename: ' + renameImgError);

            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ok' }));
            res.end();
        });
    });
})

app.post('/writeSongsImg', function(req, res) {
    var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(path.join(__dirname, 'export/imgs/' + req.body.data._id + '.png'), base64Data, 'base64', function() {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ local: 'ok' }));
        res.end();
    });

})


app.post('/tagImportedSong', function(req, res) {
    var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(path.join(__dirname, 'import/tn.png'), base64Data, 'base64', function() {

    });

        ffmpeg(path.join(__dirname, 'import/' + req.body.data.path)).outputOptions([
            '-vn',
            '-b:a 256k'
        ])
            .on('progress', function(progress) {
                io.sockets.emit('convertPosition', progress.percent.toFixed(1));

            })
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('end', function(stdout, stderr) {
                io.sockets.emit('convertPosition', 'done');


                if (typeof req.body.data.ffmpeg.common.genre === 'undefined') {
                    req.body.data.ffmpeg.common.genre = [];
                }

                if (typeof req.body.data.tags === 'undefined') {
                    req.body.data.tags = "";
                }

                // TODO: BPM? KEY? NUMBER TRACK

                var data = {
                    artist: req.body.data.ffmpeg.common.artist,
                    title: req.body.data.ffmpeg.common.title,
                    album_artist: req.body.data.tags,
                    date: req.body.data.ffmpeg.common.year,
                    album: req.body.data.ffmpeg.common.album,
                    genre: req.body.data.ffmpeg.common.genre,
                    bpm: req.body.data.ffmpeg.common.bpm,
                    //key: req.body.data.ffmpeg.common.key
                };

                var options = {
                    attachments: [path.join(__dirname, 'import/tn.png')]
                };

                ffmetadata.write(path.join(__dirname, 'import/output.mp3'), data, options, function(err) {
                    if (err) console.error("Error writing metadata", err);
                    else {
                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ local: 'ok' }));
                        res.end();
                    }
                });
        }).save(path.join(__dirname, 'import/output.mp3'));
});

app.get('/getAnySongInfo', function(req, res) {
    const mm = require('music-metadata');

    mm.parseFile(decodeURIComponent(req.query.path))
        .then( meta => {
            const fileSizeInBytes = fs.statSync(decodeURIComponent(req.query.path)).size;
            if(typeof meta.common.picture != "undefined") {
                fs.writeFile(path.join(__dirname, 'import/tn.png'), meta.common.picture[0].data, 'base64', function(err) {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ status: "ok", data: meta, size: fileSizeInBytes, path: req.query.path }));

                    res.end();
                });
            } else {

                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ status: "nope", data: meta, size: fileSizeInBytes, path: req.query.path }));

                res.end();
            }
        })
        .catch( err => {
            console.error(err.message);
        });
});

app.get('/getImportedSongInfo', function(req, res) {
    const mm = require('music-metadata');

    mm.parseFile(path.join(__dirname, 'import/' + req.query.path))
        .then( meta => {
            const fileSizeInBytes = fs.statSync(path.join(__dirname, 'import/') + req.query.path).size;
            if(typeof meta.common.picture != "undefined") {
                fs.writeFile(path.join(__dirname, 'import/tn.png'), meta.common.picture[0].data, 'base64', function(err) {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ path: "ok", data: meta, size: fileSizeInBytes, path: req.query.path }));

                    res.end();
                });
            } else {

                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ path: "nope", data: meta, size: fileSizeInBytes, path: req.query.path }));

                res.end();
            }
        })
        .catch( err => {
            console.error(err.message);
        });
});


app.get('/getLocalInfo', function(req, res) {
    const mm = require('music-metadata');
    const extension = path.extname(path.join(__dirname, 'upload/local/' + req.query.path));

    if(extension === ".mp3"
        || extension === ".flac"
        || extension === ".webm"
        || extension === ".acc"
        || extension === ".m4a"
        || extension === ".wav") {

        mm.parseFile(path.join(__dirname, 'upload/local/' + req.query.path))
            .then( metadata => {
                if(typeof metadata.common.picture != "undefined") {
                    fs.writeFile(path.join(__dirname, 'upload/local/tn.png'), metadata.common.picture[0].data, 'base64', function(err) {
                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ path: req.query.path }));

                        res.end();

                    });
                } else {

                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ path: "no image?" }));

                    res.end();
                }
            })
            .catch( err => {
                console.error(err.message);
            });


    } else {
        ffmpeg({ source: path.join(__dirname, 'upload/local/' + req.query.path), nolog: true })
            .takeScreenshots({ timemarks: [ '00:00:02.000' ], size: '1270x720' }, path.join(__dirname, 'upload/local/'), function(err, filenames) {

            });

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ path: req.query.path }));

        res.end();
    }







    /*

       ffmpeg(path.join(__dirname, 'upload/local/' + req.query.path)).outputOptions([
           '-an',
           '-filter:',
           'scale=-2:250',
           '-f',
           'jpeg'
       ])
           .on('progress', function(progress) {
               //io.sockets.emit('convertPosition', progress.percent.toFixed(1));
           })
           .on('error', function(err) {
               console.log('An error occurred: ' + err);
           })
           .on('end', function(stdout, stderr) {
               console.log('IMG DONE!');

               res.status(200);
               res.setHeader('Content-Type', 'application/json');
               res.send(JSON.stringify({ path: req.query.path }));

               res.end();

           }).save(path.join(__dirname, 'upload/local/tn.jpeg'));


       //works on video
          ffmpeg({ source: path.join(__dirname, 'upload/local/' + req.query.path), nolog: true })
               .takeScreenshots({ timemarks: [ '00:00:02.000' ], size: '1270x720' }, path.join(__dirname, 'upload/local/'), function(err, filenames) {



               });*/

});


app.get('/listImportFolder', function(req, res) {
    const directoryPath = path.join(__dirname, 'import/');
    const files = fs.readdirSync(directoryPath, 'utf8');
    const response = [];

    for (let file of files) {
        const extension = path.extname(file);
        const fileSizeInBytes = fs.statSync(path.join(__dirname, 'import/') + file).size;
        response.push({ name: file, extension, fileSizeInBytes });
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ files: response }));
    res.end();

});

app.get('/listMove', function(req, res) {
    //requiring path and fs modules
//joining path of directory
    const directoryPath = path.join(__dirname, 'upload/move');
    const files = fs.readdirSync(directoryPath, 'utf8');
    const response = [];

    for (let file of files) {
        const extension = path.extname(file);
        const fileSizeInBytes = fs.statSync(path.join(__dirname, 'upload/move/') + file).size;
        response.push({ name: file, extension, fileSizeInBytes });
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ files: response }));
    res.end();

});


app.get('/listLocal', function(req, res) {
    //requiring path and fs modules
//joining path of directory
    const directoryPath = path.join(__dirname, 'upload/local');
    const files = fs.readdirSync(directoryPath, 'utf8');
    const response = [];

    for (let file of files) {
        const extension = path.extname(file);
        const fileSizeInBytes = fs.statSync(path.join(__dirname, 'upload/local/') + file).size;
        response.push({ name: file, extension, fileSizeInBytes });
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ files: response }));
    res.end();

});


app.post('/DownloadAll', function(req, res) {
    if(req.body.data) {
        const url = 'https://www.youtube.com/watch?v=' + req.body.data.youtubeID;

        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var tags = req.body.data.youtubeTags;
            var myStr = tags.toString();

            var tagsString = myStr.replace(/,/g, " ");

            const video = youtubedl(url,
                // Optional arguments passed to youtube-dl.
                ['--no-continue'],
                // Additional options can be given for calling `child_process.execFile()`.
                { cwd: __dirname });

// Will be called when the download starts.
            video.on('info', function(info) {
                size = info.size;
            });

            video.on('error', function(info) {
                console.error(info);
            });

            video.on('data', function(chunk) {
                pos += chunk.length;
                if (size) {
                    progress = (pos / size * 100).toFixed(1);
                    io.sockets.emit('downloadPosition', progress);
                    //console.log("DL: " + progress  + '%');
                }
            });
            video.on('end', function(info) {
                var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

                fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.png'), base64Data, 'base64', function(err) {
                    console.log(err);
                });

                ffmpeg(path.join(__dirname, 'ytdl/temp.mp4')).outputOptions([
                    '-metadata',
                    'artist=' + req.body.data.youtubeOriginal,
                    '-profile:v',
                    'baseline',
                    '-level',
                    '3.0',
                    '-movflags',
                    'faststart',
                    '-crf',
                    '21',
                    '-f',
                    'mp4'
                ])
                    .on('progress', function(progress) {
                        io.sockets.emit('convertPosition', progress.percent.toFixed(1));
                    })
                    .on('error', function(err) {
                        console.log('An error occurred: ' + err);
                    })
                    .on('end', function(stdout, stderr) {
                        console.log('FF DONE!');
                        YTFFactive = false;
                        io.sockets.emit('YTFFactive', false);
                        io.sockets.emit('convertPosition', 'done');

                        fs.rename(path.join(__dirname, 'upload/output.mp4'), path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.mp4'), function(renameError) {
                            if ( renameError ) console.error('rename: ' + renameError);

                            ffmpeg(path.join(__dirname, 'ytdl/temp.mp4')).outputOptions([
                                '-vn',
                                '-b:a 256k'
                            ])
                                .on('progress', function(progress) {
                                    io.sockets.emit('convertPosition', progress.percent.toFixed(1));

                                })
                                .on('error', function(err) {
                                    console.log('An error occurred: ' + err.message);
                                })
                                .on('end', function(stdout, stderr) {
                                    console.log('FF DONE!');
                                    YTFFactive = false;
                                    io.sockets.emit('YTFFactive', false);
                                    io.sockets.emit('convertPosition', 'done');


                                    if (typeof req.body.data.youtubeAlbum === 'undefined') {
                                        req.body.data.youtubeAlbum = "";
                                    }

                                    if (typeof req.body.data.youtubeGenre === 'undefined') {
                                        req.body.data.youtubeAlbum = "";
                                    }

                                    var data = {
                                        artist: req.body.data.youtubeArtist,
                                        title: req.body.data.youtubeTitle,
                                        album_artist: tagsString,
                                        date: req.body.data.youtubeYear,
                                        album: req.body.data.youtubeAlbum,
                                        label: req.body.data.youtubeID,
                                        genre: req.body.data.youtubeGenre
                                    };

                                    var options = {
                                        attachments: [path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.png')]
                                    };

                                    ffmetadata.write(path.join(__dirname, 'upload/output.mp3'), data, options, function(err) {
                                        if (err) console.error("Error writing metadata", err);
                                        else {
                                            console.log('META DONE!');

                                            fs.rename(path.join(__dirname, 'upload/output.mp3'), path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.mp3'), function(renameError) {
                                                if ( renameError ) console.error('rename: ' + renameError);

                                                res.status(200);
                                                res.setHeader('Content-Type', 'application/json');
                                                res.send(JSON.stringify({ local: 'DONE' }));
                                                res.end();
                                            });
                                        }
                                    });
                                }).save(path.join(__dirname, 'upload/output.mp3'));
                        });
                    }).save(path.join(__dirname, 'upload/output.mp4'));
            });

            video.pipe(fs.createWriteStream(path.join(__dirname, 'ytdl/temp.mp4')))
        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});

app.post('/downloadVideo', function(req, res) {
    if(req.body.data) {
        const url = 'https://www.youtube.com/watch?v=' + req.body.data.youtubeID;

        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var tags = req.body.data.youtubeTags;
            var myStr = tags.toString();

            var tagsString = myStr.replace(/,/g, " ");

            const video = youtubedl(url,
                // Optional arguments passed to youtube-dl.
                ['--no-continue'],
                // Additional options can be given for calling `child_process.execFile()`.
                { cwd: __dirname });

// Will be called when the download starts.
            video.on('info', function(info) {
                size = info.size;
            });

            video.on('error', function(info) {
                console.error(info);
            });

            video.on('data', function(chunk) {
                pos += chunk.length;
                if (size) {
                    progress = (pos / size * 100).toFixed(1);
                    io.sockets.emit('downloadPosition', progress);
                    //console.log("DL: " + progress  + '%');
                }
            });
            video.on('end', function(info) {
                var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

                fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.png'), base64Data, 'base64', function(err) {
                    console.log(err);
                });

                ffmpeg(path.join(__dirname, 'ytdl/temp.mp4')).outputOptions([
                    '-an',
                    '-metadata',
                    'artist=' + req.body.data.youtubeOriginal,
                    '-profile:v',
                    'baseline',
                    '-level',
                    '3.0',
                    '-movflags',
                    'faststart',
                    '-crf',
                    '21',
                    '-f',
                    'mp4'
                ])
                    .on('progress', function(progress) {
                        io.sockets.emit('convertPosition', progress.percent.toFixed(1));
                    })
                    .on('error', function(err) {
                        console.log('An error occurred: ' + err);
                    })
                    .on('end', function(stdout, stderr) {
                        console.log('FF DONE!');
                        YTFFactive = false;
                        io.sockets.emit('YTFFactive', false);
                        io.sockets.emit('convertPosition', 'done');

                        fs.rename(path.join(__dirname, 'upload/output.mp4'), path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.mp4'), function(renameError) {
                            if ( renameError ) console.error('rename: ' + renameError);

                            res.status(200);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify({ local: 'DONE' }));
                            res.end();
                        });
                    }).save(path.join(__dirname, 'upload/output.mp4'));
            });

            video.pipe(fs.createWriteStream(path.join(__dirname, 'ytdl/temp.mp4')))
        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});


app.post('/MoveEffect', function(req, res) {
    if(req.body.data) {
        var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(path.join(__dirname, 'export/imgs/' + req.body.data._id + '.png'), base64Data, 'base64', function(errImg) {
            if ( errImg ) console.error('rename: ' + errImg);

            fs.rename(path.join(__dirname, 'import/' + req.body.data.path), path.join(__dirname, 'export/effects/' + req.body.data._id + '.mp4'), function(renameError) {
                if ( renameError ) console.error('rename: ' + renameError);
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ local: 'ok' }));
                    res.end();
            });
        });
    }
});

app.post('/MoveMovie', function(req, res) {
    if(req.body.data) {
        fs.rename(path.join(__dirname, 'import/' + req.body.data.path), path.join(__dirname, 'export/movies/' + req.body.data._id + '.mp4'), function(renameError) {
            if ( renameError ) console.error('rename: ' + renameError);

            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'JOP' }));
            res.end();
        });
    }
});


app.post('/MoveVideo', function(req, res) {
    if(req.body.data) {

            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");


            console.log(req.body.data.youtubeID);


            fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.png'), base64Data, 'base64', function(err) {
                //console.log(err);

                console.log("IMAGE");

                fs.rename(path.join(__dirname, 'upload/move/' + req.body.data.youtubeID), path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.mp4'), function(renameError) {
                    if ( renameError ) console.error('rename: ' + renameError);

                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ local: 'DONE' }));
                    res.end();
                });

            });

    }
});

app.post('/convertVideo', function(req, res) {
    if(req.body.data) {
        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

            fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.png'), base64Data, 'base64', function(err) {
                //console.log(err);
            });

            ffmpeg(path.join(__dirname, 'upload/local/' + req.body.data.youtubeOriginal)).outputOptions([
                '-an',
                '-metadata',
                'artist=' + req.body.data.youtubeOriginal,
                '-profile:v',
                'baseline',
                '-level',
                '3.0',
                '-movflags',
                'faststart',
                '-crf',
                '21',
                '-f',
                'mp4'
            ])
                .on('progress', function(progress) {
                    io.sockets.emit('convertPosition', progress.percent.toFixed(1));
                })
                .on('error', function(err) {
                    console.log('An error occurred: ' + err);
                })
                .on('end', function(stdout, stderr) {
                    console.log('FF DONE!');
                    YTFFactive = false;
                    io.sockets.emit('YTFFactive', false);
                    io.sockets.emit('convertPosition', 'done');


                    fs.rename(path.join(__dirname, 'upload/output.mp4'), path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.mp4'), function(renameError) {
                        if ( renameError ) console.error('rename: ' + renameError);

                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ local: 'DONE' }));
                        res.end();
                    });
                }).save(path.join(__dirname, 'upload/output.mp4'));


        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});

app.post('/convertAll', function(req, res) {
    if(req.body.data) {
        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

            fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.png'), base64Data, 'base64', function(err) {
                //console.log(err);
            });

            ffmpeg(path.join(__dirname, 'upload/local/' + req.body.data.youtubeOriginal)).outputOptions([
                '-metadata',
                'artist=' + req.body.data.youtubeOriginal,
                '-profile:v',
                'baseline',
                '-level',
                '3.0',
                '-movflags',
                'faststart',
                '-crf',
                '21',
                '-f',
                'mp4'
            ])
                .on('progress', function(progress) {
                    io.sockets.emit('convertPosition', progress.percent.toFixed(1));
                })
                .on('error', function(err) {
                    console.log('An error occurred: ' + err);
                })
                .on('end', function(stdout, stderr) {
                    console.log('FF DONE!');
                    YTFFactive = false;
                    io.sockets.emit('YTFFactive', false);
                    io.sockets.emit('convertPosition', 'done');


                    fs.rename(path.join(__dirname, 'upload/output.mp4'), path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.mp4'), function(renameError) {
                        if ( renameError ) console.error('rename: ' + renameError);

                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ local: 'DONE' }));
                        res.end();
                    });
                }).save(path.join(__dirname, 'upload/output.mp4'));


        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});

app.post('/convertAudio', function(req, res) {
    if(req.body.data) {
        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

            fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.png'), base64Data, 'base64', function(err) {
                //console.log(err);
            });

            var tags = req.body.data.youtubeTags;

            if (typeof tags === 'undefined') {
                var myStr = "";
            } else {
                var myStr = tags.toString();
            }


            var tagsString = myStr.replace(/,/g, " ");

            ffmpeg(path.join(__dirname, 'upload/local/' + req.body.data.youtubeOriginal)).outputOptions([
                '-vn',
                '-b:a 256k'
            ])
                .on('progress', function(progress) {
                    io.sockets.emit('convertPosition', progress.percent.toFixed(1));

                })
                .on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function(stdout, stderr) {
                    console.log('FF DONE!');
                    YTFFactive = false;
                    io.sockets.emit('YTFFactive', false);
                    io.sockets.emit('convertPosition', 'done');


                    if (typeof req.body.data.youtubeAlbum === 'undefined') {
                        req.body.data.youtubeAlbum = "";
                    }

                    if (typeof req.body.data.youtubeGenre === 'undefined') {
                        req.body.data.youtubeAlbum = "";
                    }

                    var data = {
                        artist: req.body.data.youtubeArtist,
                        title: req.body.data.youtubeTitle,
                        album_artist: tagsString,
                        date: req.body.data.youtubeYear,
                        album: req.body.data.youtubeAlbum,
                        label: req.body.data.youtubeID,
                        genre: req.body.data.youtubeGenre
                    };

                    var options = {
                        attachments: [path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.png')]
                    };

                    ffmetadata.write(path.join(__dirname, 'upload/output.mp3'), data, options, function(err) {
                        if (err) console.error("Error writing metadata", err);
                        else {
                            console.log('META DONE!');

                            fs.rename(path.join(__dirname, 'upload/output.mp3'), path.join(__dirname, 'upload/' + req.body.data.youtubeOriginal + '.mp3'), function(renameError) {
                                if ( renameError ) console.error('rename: ' + renameError);

                                res.status(200);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify({ local: 'DONE' }));
                                res.end();
                            });
                        }
                    });
                }).save(path.join(__dirname, 'upload/output.mp3'));


        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});


app.post('/convertPSP', function(req, res) {
    if(req.body.data) {
        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var filename = req.body.data.youtubeOriginal.replace(/^.*[\\\/]/, '');

            ffmpeg(path.join(__dirname, 'upload/local/' + filename)).outputOptions([
                '-flags',
                '+bitexact',
                '-vcodec',
                'libx264',
                '-profile:v',
                'baseline',
                '-level',
                '3.0',
                '-s',
                '480x272',
                '-r',
                '29.97',
                '-b:v',
                '999k',
                '-acodec',
                'aac',
                '-b:a',
                '192k',
                '-ar',
                '48000',
                '-f',
                'psp',
                '-strict',
                '-2'
            ])
                .on('progress', function(progress) {
                    io.sockets.emit('convertPosition', progress.percent.toFixed(1));
                })
                .on('error', function(err) {
                    console.log('An error occurred: ' + err);
                })
                .on('end', function(stdout, stderr) {
                    console.log('FF DONE!');
                    YTFFactive = false;
                    io.sockets.emit('YTFFactive', false);
                    io.sockets.emit('convertPosition', 'done');

                    fs.rename(path.join(__dirname, 'upload/output.mp4'), path.join(__dirname, 'upload/psp.mp4'), function(renameError) {
                        if ( renameError ) console.error('rename: ' + renameError);

                        ffmpeg(path.join(__dirname, 'upload/psp.mp4')).outputOptions([
                            '-f',
                            'image2',
                            '-ss',
                            '5',
                            '-vframes',
                            '1',
                            '-s',
                            '160x120'
                        ])
                            .on('progress', function(progress) {

                            })
                            .on('error', function(err) {
                                console.log('An error occurred: ' + err);
                            })
                            .on('end', function(stdout, stderr) {

                                res.status(200);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify({ local: 'DONE' }));
                                res.end();

                            }).save(path.join(__dirname, 'upload/psp.THM'));
                    });
                }).save(path.join(__dirname, 'upload/output.mp4'));

        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});

app.post('/downloadAudio', function(req, res) {
    if(req.body.data) {
        const url = 'https://www.youtube.com/watch?v=' + req.body.data.youtubeID;

        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            var tags = req.body.data.youtubeTags;

            if (typeof tags === 'undefined') {
                var myStr = "";
            } else {
                var myStr = tags.toString();
            }
            

            var tagsString = myStr.replace(/,/g, " ");

            const video = youtubedl(url,
                // Optional arguments passed to youtube-dl.
                ['--no-continue', '-o', path.join(__dirname, 'ytdl/temp.mp4'), '--format', 'best[ext=mp4]'],
                // Additional options can be given for calling `child_process.execFile()`.
                { cwd: __dirname });

// Will be called when the download starts.
            video.on('info', function(info) {
                size = info.size;
            });

            video.on('error', function(info) {
                console.error(info);
            });

            video.on('data', function(chunk) {
                pos += chunk.length;
                if (size) {
                    progress = (pos / size * 100).toFixed(1);
                    io.sockets.emit('downloadPosition', progress);
                    //console.log("DL: " + progress  + '%');
                }
            });
            video.on('end', function(info) {
                var base64Data = req.body.data.imgCover.replace(/^data:image\/png;base64,/, "");

                fs.writeFile(path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.png'), base64Data, 'base64', function(err) {
                    console.log(err);
                });

                ffmpeg(path.join(__dirname, 'ytdl/temp.mp4')).outputOptions([
                    '-vn',
                    '-b:a 256k'
                ])
                    .on('progress', function(progress) {
                        io.sockets.emit('convertPosition', progress.percent.toFixed(1));

                    })
                    .on('error', function(err) {
                        console.log('An error occurred: ' + err.message);
                    })
                    .on('end', function(stdout, stderr) {
                        console.log('FF DONE!');
                        YTFFactive = false;
                        io.sockets.emit('YTFFactive', false);
                        io.sockets.emit('convertPosition', 'done');


                        if (typeof req.body.data.youtubeAlbum === 'undefined') {
                            req.body.data.youtubeAlbum = "";
                        }

                        if (typeof req.body.data.youtubeGenre === 'undefined') {
                            req.body.data.youtubeAlbum = "";
                        }

                        var data = {
                            artist: req.body.data.youtubeArtist,
                            title: req.body.data.youtubeTitle,
                            album_artist: tagsString,
                            date: req.body.data.youtubeYear,
                            album: req.body.data.youtubeAlbum,
                            label: req.body.data.youtubeID,
                            genre: req.body.data.youtubeGenre
                        };

                        var options = {
                            attachments: [path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.png')]
                        };

                        ffmetadata.write(path.join(__dirname, 'upload/output.mp3'), data, options, function(err) {
                            if (err) console.error("Error writing metadata", err);
                            else {
                                console.log('META DONE!');

                                fs.rename(path.join(__dirname, 'upload/output.mp3'), path.join(__dirname, 'upload/' + req.body.data.youtubeID + '.mp3'), function(renameError) {
                                    if ( renameError ) console.error('rename: ' + renameError);

                                    res.status(200);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify({ local: 'DONE' }));
                                    res.end();
                                });
                            }
                        });
                    }).save(path.join(__dirname, 'upload/output.mp3'));
            });

            video.pipe(fs.createWriteStream(path.join(__dirname, 'ytdl/temp.mp4')))
        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ local: 'ACTIVE!!!' }));
            res.end();
        }
    }
});

// RENDER ALL COLLECTIONS IN DATABASE
app.get("/ffmpeg", (req, res) => {

    var pathToMovie = './demo.avi';

    res.status(204);

    var proc = ffmpeg(pathToMovie)

        .preset('flashvideo')

        .on('end', function () {

            console.log('Stream Done');

        })

        .pipe(res);


});

// RENDER ALL COLLECTIONS IN DATABASE
app.get("/collections", (req, res) => {
    mongoose.connection.db.listCollections().toArray(function (err, names) {
            res.status(200);
            res.send(names);
            res.end();
        });
});

// SWAGGER API DOC
// DOC is generated automatic by Express routes, BUT....
// but it is NOT exporting parameters in PUT/POST, like name/email/pass and do on...
// list routes, NOT parameters but if you know me, you know that ME = NO doc/comments
// $$$ BIG BOUNTY for who will find automatized solution !!!

//let data = JSON.stringify(spec)
//fs.writeFileSync('data.json', data);
expressOasGenerator.init(app, {});

// CONNECT TO DATABASE
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
	useNewUrlParser: true
}).then(() => {
    console.log("Database connected");
}).catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
});


// START SERVER
/*app.listen(3000, () => {
    console.log("Server running");
});*/



var nicknames = [];

function filterNullValues(i) {
    return (i!=null);
}

io.on('connection', function(socket){
    // TODO: create model for rooms: socket.join('all');
    //console.log('a user connected');
    io.sockets.emit('connectCounter', Object.keys(io.sockets.sockets).filter(filterNullValues).length);

    //io.sockets.emit('front', 10);

    socket.on('front', function(data){
        console.log(data);
    });


    socket.on('new user', function(data){
        var tmp = {
            id: socket.id,
            data: data,
            geo: geoip.lookup(data.publicIp)
        };

        nicknames.push(tmp);

        updateNicknames(nicknames);
        updateNewcommer(tmp);
    });

    function updateNicknames(x){
        io.sockets.emit('usernames', x);
    }

    function updateNewcommer(x){
        io.sockets.emit('newcommer', x);
    }

    socket.on('disconnect', function(data){
        var index=nicknames.map(function(x){
            return x.id;
        }).indexOf(socket.id);

        nicknames.splice(index,1);

        io.sockets.emit('connectCounter', Object.keys(io.sockets.sockets).filter(filterNullValues).length);
        //console.log(nicknames);
        updateNicknames(nicknames);
    });
});


http.listen(3000, function(){
    console.log('   *****  YEA *****    ..."should" run on: http://localhost:3000');
	// opens the url in the default browser 
	//opn('http://localhost:3000');

});
