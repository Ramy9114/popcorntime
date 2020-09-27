const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    User_id: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    postalCode: {
        type: String,
        required: false
    },

});

module.exports = mongoose.model('Address', AddressSchema);