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
                type: String
            },
            dateAndTime:{
                type: String
            },
            photo: {
                type: String
            },
            name: {
                type: String
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
