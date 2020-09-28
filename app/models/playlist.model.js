const mongoose = require('mongoose');

const PlaylistSchema = mongoose.Schema({
    title: String,
    content: String,
    nodes: Array,
    edges: Array,
    delete: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Playlists', PlaylistSchema);