const mongoose = require('mongoose');

const SongSchema = mongoose.Schema({
    size: String,
    tags: Array,
    duration: String,
    ffmpeg: Object,
    path: String,
    label: String,
    shape: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Songs', SongSchema);