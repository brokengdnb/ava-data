// DEPENDICIES
const fs = require('fs');
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressOasGenerator = require("express-oas-generator");
const fileUpload = require('express-fileupload');
//const multer = require('multer');




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

// SET PUG template rendering
app.set('view engine', 'pug');

// SET public and upload folder for backup/restore
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, 'upload')));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

//SET MULTER
//app.use(multer());

// SET FILE UPLOADER
app.use(fileUpload());

// ROUTES
require("./app/routes/note.routes.js")(app);
require("./app/routes/backup.routes.js")(app);
require("./app/routes/search.routes.js")(app);
// define a default ROUTE to redirect to API-DOC
app.get("/", (req, res) => {
    fs.readFile('package.json', 'utf8', function (err, data) {
        if (err) throw err;
        var configData = JSON.parse(data);
        res.render(
            'index',
            {
                appName: configData.name,
                appVersion: configData.name + " v" + configData.version,
            });
    });
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

app.get('/ytimg', function(req, res) {
    if(req.query.id) {
        const url = 'https://www.youtube.com/watch?v=' + req.query.id;

        const options = {
            // Downloads available thumbnail.
            all: false,
            // The directory to save the downloaded files in.
            cwd: 'ytdl',
        };

        youtubedl.getThumbs(url, options, function(err, files) {
            if (err) console.log('ERROR: ' + err);

            sharp('ytdl/' + files)
                .resize(500)
                .toFile('upload/temp.jpg', (errr, info) => {
                    if (errr) console.error('image processing: ' + errr);

                    fs.stat('ytdl/' + files, function (errrr, stats) {
                        //console.log(stats);//here we got all information of file in stats variable
                        if (errrr) {
                            return console.error(errrr);
                        }

                        fs.unlink('ytdl/' + files,function(error){
                            if(error) return console.log(error);

                            res.status(200);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify({ file: files }));
                            res.end();
                        });
                    });
                });
        })
    } else {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ file: "NOT-FOUND" }));
        res.end();
    }


});

app.get('/download', function(req, res) {
    if(req.query.id) {
        const url = 'https://www.youtube.com/watch?v=' + req.query.id;

        if(!YTFFactive) {
            let size = 0;
            let pos = 0;
            let progress = 0;
            YTFFactive = true;
            io.sockets.emit('YTFFactive', true);

            const video = youtubedl(url,
                // Optional arguments passed to youtube-dl.
                ['--no-continue', '-i', '-o', 'ytdl/temp.mp4', '--format', 'bestvideo[ext=mp4]'],
                // Additional options can be given for calling `child_process.execFile()`.
                { cwd: __dirname })

// Will be called when the download starts.
            video.on('info', function(info) {
                console.log('Download started')
                console.log('filename: ' + info._filename);
                console.log('size: ' + info.size);
                size = info.size;
            });

            video.on('data', function(chunk) {
                pos += chunk.length;
                if (size) {
                    progress = (pos / size * 100).toFixed(1);
                    io.sockets.emit('downloadPosition', progress);
                    console.log("DL: " + progress  + '%');
                }
            });


            video.on('end', function(info) {
                ffmpeg('ytdl/temp.mp4').outputOptions([
                    '-c:v libx264',
                    '-strict experimental',
                    '-crf 23',
                    '-profile:v baseline',
                    '-movflags faststart'
                ]).noAudio()
                    .on('progress', function(progress) {
                        io.sockets.emit('convertPosition', progress.percent.toFixed(1));
                        console.log('FF: ' + progress.percent.toFixed(1) + '%');
                    })
                    .on('error', function(err) {
                        console.log('An error occurred: ' + err.message);
                    })
                    .on('end', function(stdout, stderr) {
                        console.log('DONE!');
                        YTFFactive = false;
                        io.sockets.emit('YTFFactive', false);

                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ local: 'DONE' }));
                        res.end();
                    }).save('ytdl/output.mp4');

            });

            video.pipe(fs.createWriteStream('ytdl/temp.mp4'))


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

                fs.writeFile('upload/effects/' + req.body.data.youtubeID + '.png', base64Data, 'base64', function(err) {
                    console.log(err);
                });

                ffmpeg('ytdl/temp.mp4').outputOptions([
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

                        fs.rename('upload/output.mp4', 'upload/' + req.body.data.youtubeID + '.mp4', function(renameError) {
                            if ( renameError ) console.error('rename: ' + renameError);

                            res.status(200);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify({ local: 'DONE' }));
                            res.end();
                        });
                    }).save('upload/output.mp4');
            });

            video.pipe(fs.createWriteStream('ytdl/temp.mp4'))
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
            var myStr = tags.toString();

            var tagsString = myStr.replace(/,/g, " ");

            const video = youtubedl(url,
                // Optional arguments passed to youtube-dl.
                ['--no-continue', '-o', 'ytdl/temp.mp4', '--format', 'best[ext=mp4]'],
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

                fs.writeFile("upload/temp.png", base64Data, 'base64', function(err) {
                    console.log(err);
                });

                ffmpeg('ytdl/temp.mp4').outputOptions([
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
                            attachments: ["upload/temp.png"]
                        };

                        ffmetadata.write("upload/output.mp3", data, options, function(err) {
                            if (err) console.error("Error writing metadata", err);
                            else {
                                console.log('META DONE!');

                                fs.rename('upload/output.mp3', 'upload/' + req.body.data.youtubeID + '.mp3', function(renameError) {
                                    if ( renameError ) console.error('rename: ' + renameError);

                                    res.status(200);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify({ local: 'DONE' }));
                                    res.end();
                                });
                            }
                        });
                    }).save('upload/output.mp3');
            });

            video.pipe(fs.createWriteStream('ytdl/temp.mp4'))
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
    console.log('   *****  YEA  hope so *****    ..."should" run on: http://localhost:' + 3000);


});
