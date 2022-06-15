const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    userEmail: {
        type: String,
        ref: 'User',
        required: true
    },
    RequestedEmails: [{
        requestedEmail: {
            type: String,
            ref: 'User',
            required: true
        },
        accepted: {
            type: Number,
            default: 0
        }
    }],


}, {
    timestamps: true
}, {
    collection: 'Request'
});


module.exports = mongoose.model('Request', requestSchema);