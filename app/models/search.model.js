const mongoose = require('mongoose');

const SearchSchema = mongoose.Schema({
    title: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Search', SearchSchema);
