module.exports = (app) => {
    const search = require('../controllers/search.controller.js');

    app.post('/api/search', search.create);
    app.get('/api/search', search.findAll);
    app.get('/api/search/:searchId', search.findOne);
    app.put('/api/search/:searchId', search.update);
    app.delete('/api/search/:searchId', search.delete);
}
