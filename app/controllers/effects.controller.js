const Effect = require('../models/effects.model.js');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request

    // Create a Note
    const effect = new Effect({
        title: req.body.title || "Untitled Note",
        ffmpeg: req.body.ffmpeg,
        path: req.body.path,
        size: req.body.size,
        duration: req.body.duration,
        tags: req.body.tags,
        audio: req.body.audio,
        genre: req.body.genre,
        streams: req.body.streams,
        lastTimePlayed: "",
        shape: req.body.shape
    });

    // Save Note in the database
    effect.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    Effect.find()
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
    Effect.findById(req.params.effectId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.effectId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.effectId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.effectId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request


    // Find note and update it with the request body
    Effect.findByIdAndUpdate(req.params.effectId, {
        title: req.body.title || "Untitled Note",
        ffmpeg: req.body.ffmpeg,
        path: req.body.path,
        size: req.body.size,
        duration: req.body.duration,
        tags: req.body.tags,
        audio: req.body.audio,
        genre: req.body.genre,
        streams: req.body.streams,
        lastTimePlayed: req.body.lastTimePlayed,
        shape: req.body.shape
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.effectId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.effectId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.effectId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Effect.findByIdAndRemove(req.params.effectId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.effectId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.effectId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.effectId
        });
    });
};
