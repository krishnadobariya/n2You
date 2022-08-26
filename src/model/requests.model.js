const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    userEmail: {
        type: String,
        ref: 'User',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
            default: 2
        },
        respond:{
            type: Number,
            default: 0
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }],


}, {
    timestamps: true
}, {
    collection: 'Request'
});


module.exports = mongoose.model('Request', requestSchema);
