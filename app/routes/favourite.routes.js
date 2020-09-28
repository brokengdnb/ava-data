module.exports = (app) => {
    const favourites = require('../controllers/favourite.controller.js');
    const cors = require('cors');

    app.use(cors());

    // Create a new Note
    app.post('/api/favourites', favourites.create);

    // Retrieve all Notes
    app.get('/api/favourites', favourites.findAll);

    // Retrieve a single Note with noteId
    app.get('/api/favourites/:id', favourites.findOne);

    // Update a Note with noteId
    app.post('/api/favourites/:id', favourites.update);

    // Delete a Note with noteId
    app.delete('/api/favourites/:id', favourites.delete);
}