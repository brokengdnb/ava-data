const mongoose = require('mongoose');

const EffectSchema = mongoose.Schema({
    title: String,
    ffmpeg: String,
    path: String,
    size: String,
    duration: String,
    audio: Boolean,
    genre: String,
    tags: Array,
    streams: Object,
    lastTimePlayed: String,
    shape: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Effects', EffectSchema);