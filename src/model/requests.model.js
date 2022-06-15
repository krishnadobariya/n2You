const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    userEmail: {
        type: String,
        ref: 'User',
        required: true
    },
    RequestedEmail: {
        type: String,
        ref: 'User',
        required: true
    },
    accepted: {
        type: Boolean,
        default: 0
    }

}, {
    timestamps: true
}, {
    collection: 'Request'
});


module.exports = requestSchema;