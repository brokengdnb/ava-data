const Song = require('../models/song.model.js');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    // Create a Note


    const song = new Song({
        size: req.body.size,
        tags: req.body.tags,
        duration: req.body.duration,
        ffmpeg: req.body.ffmpeg,
        path: req.body.path,
        label: req.body.label,
        shape: req.body.shape
    });

    // Save Note in the database
    song.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

exports.deleteMany = (req, res) => {
    let files = req.body.files;

    if(files){
        Song.deleteMany({
            _id: {
                $in: files
            }
        }).then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting MANY."
            });
        });
    }
};

exports.createMany = (req, res) => {
    Song.insertMany(req.body.files).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating MANY."
        });
    });
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    Song.find()
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    Song.findById(req.params.songId).then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.songId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.songId
            });
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.movieId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request


    // Find note and update it with the request body
    Song.findByIdAndUpdate(req.params.songId, {
        size: req.body.size,
        tags: req.body.tags,
        duration: req.body.duration,
        ffmpeg: req.body.ffmpeg,
        label: req.body.label,
        path: req.body.path,
        shape: req.body.shape
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.songId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.songId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.songId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Song.findByIdAndRemove(req.params.songId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.songId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.songId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.movieId
        });
    });
};
