const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    requestedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    chat: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId
            },
            text: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ]

}, {
    timestamps: true
}, {
    collection: 'chat'
});

module.exports = mongoose.model('chat', chatSchema);