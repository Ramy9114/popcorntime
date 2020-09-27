const mongoose = require('mongoose')

const SessionSchema = new mongoose.Schema({
    User_id: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: false
    }
})


module.exports = mongoose.model('Session', SessionSchema)