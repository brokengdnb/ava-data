const Playlist = require('../models/playlist.model.js');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request


    // Create a Note
    const playlist = new Playlist({
        title: req.body.title || "Untitled Note", 
        content: req.body.content,
        nodes: req.body.nodes,
        edges: req.body.edges,
        delete: false
    });

    // Save Note in the database
    playlist.save()
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
    Playlist.find()
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
    Playlist.findById(req.params.playlistId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.playlistId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.playlistId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.playlistId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request


    // Find note and update it with the request body
    Playlist.findByIdAndUpdate(req.params.playlistId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content,
        nodes: req.body.nodes,
        edges: req.body.edges,
        delete: false
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.playlistId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.playlistId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.playlistId
        });
    });
};


exports.deleteMany = (req, res) => {
    let files = req.body.files;

    if(files){
        Playlist.deleteMany({
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

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Playlist.findByIdAndRemove(req.params.playlistId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.playlistId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.playlistId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.playlistId
        });
    });
};
