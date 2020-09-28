const Movie = require('../models/movie.model.js');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    // Create a Note
    const movie = new Movie({
        title: req.body.title || "Untitled Movie",
        year: req.body.year,
        tags: req.body.tags,
        size: req.body.size,
        genre: req.body.genre,
        duration: req.body.duration,
        streams: req.body.streams,
        path: req.body.path,
    });

    // Save Note in the database
    movie.save()
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
    Movie.find()
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
    Movie.findById(req.params.movieId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.movieId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.movieId
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
    Movie.findByIdAndUpdate(req.params.movieId, {
        title: req.body.title || "Untitled Movie",
        year: req.body.year,
        tags: req.body.tags,
        size: req.body.size,
        genre: req.body.genre,
        duration: req.body.duration,
        streams: req.body.streams,
        path: req.body.path,
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.movieId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.movieId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.movieId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Movie.findByIdAndRemove(req.params.movieId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.movieId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.movieId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.movieId
        });
    });
};
