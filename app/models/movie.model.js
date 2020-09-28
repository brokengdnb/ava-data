const mongoose = require('mongoose');

const MovieSchema = mongoose.Schema({
    title: String,
    year: String,
    genre: String,
    size: String,
    tags: Array,
    duration: String,
    streams: Object,
    path: String,

}, {
    timestamps: true
});

module.exports = mongoose.model('Movies', MovieSchema);