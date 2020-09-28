const mongoose = require('mongoose');

const FavouriteSchema = mongoose.Schema({
    id: String,
    youtubeID: String,
    itemId: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Favourites', FavouriteSchema);