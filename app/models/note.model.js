const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    title: String,
    youtubeArtist: String,
    youtubeTitle: String,
    youtubeYear: String,
    youtubeID: String,
    youtubeAlbum: String,
    youtubeGenre: String,
    youtubeTags: Array,
    lastTime: Number,
    lastTimePlayed: String,
    shape: String,
    favourite: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Notes', NoteSchema);