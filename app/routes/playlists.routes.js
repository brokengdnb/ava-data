module.exports = (app) => {
    const playlists = require('../controllers/playlist.controller.js');
    const cors = require('cors');

    app.use(cors());

    // Create a new Note
    app.post('/api/playlists', playlists.create);

    // Retrieve all Notes
    app.get('/api/playlists', playlists.findAll);

    // Retrieve a single Note with noteId
    app.get('/api/playlists/:playlistId', playlists.findOne);

    // Update a Note with noteId
    app.put('/api/playlists/:playlistId', playlists.update);

    // Delete a Note with noteId
    app.delete('/api/playlists/:playlistId', playlists.delete);

    //delete many :p
    app.post('/api/playlists/deleteMany', playlists.deleteMany);

}