const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
        required: false
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    external_id: {
        type: String,
        required: false
    },
    poster: {
        type: String,
        required: false
    },
    trailerLink: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: false
    },
    views: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('Movie', MovieSchema);