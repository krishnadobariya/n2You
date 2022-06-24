const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
            },
            read: {
                type: Number,
                default: 1
            }
        }
    ]

}, {
    timestamps: true
}, {
    collection: 'chat'
});

module.exports = mongoose.model('chat', chatSchema);