module.exports = (app) => {
    const effects = require('../controllers/effects.controller.js');
    const cors = require('cors');

    app.use(cors());

    // Create a new Note
    app.post('/api/effects', effects.create);

    // Retrieve all Notes
    app.get('/api/effects', effects.findAll);

    // Retrieve a single Note with noteId
    app.get('/api/effects/:effectId', effects.findOne);

    // Update a Note with noteId
    app.post('/api/effects/:effectId', effects.update);

    // Delete a Note with noteId
    app.delete('/api/effects/:effectId', effects.delete);
}