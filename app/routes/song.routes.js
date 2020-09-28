module.exports = (app) => {
    const songs = require('../controllers/song.controller.js');
    const cors = require('cors');

    app.use(cors());

    // Create a new Note
    app.post('/api/songs', songs.create);

    //add many
    app.post('/api/songsMany', songs.createMany);

    //delete many :p
    app.post('/api/songs/deleteMany', songs.deleteMany);

    // Retrieve all Notes
    app.get('/api/songs', songs.findAll);

    // Retrieve a single Note with noteId
    app.get('/api/songs/:songId', songs.findOne);

    // Update a Note with noteId
    app.post('/api/songs/:songId', songs.update);

    // Delete a Note with noteId
    app.delete('/api/songs/:songId', songs.delete);
}