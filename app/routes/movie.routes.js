module.exports = (app) => {
    const movies = require('../controllers/movie.controller.js');
    const cors = require('cors');

    app.use(cors());

    // Create a new Note
    app.post('/api/movies', movies.create);

    // Retrieve all Notes
    app.get('/api/movies', movies.findAll);

    // Retrieve a single Note with noteId
    app.get('/api/movies/:movieId', movies.findOne);

    // Update a Note with noteId
    app.post('/api/movies/:movieId', movies.update);

    // Delete a Note with noteId
    app.delete('/api/movies/:movieId', movies.delete);
}