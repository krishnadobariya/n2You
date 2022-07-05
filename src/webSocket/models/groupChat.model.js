const mongoose = require("mongoose");

const groupChatSchema = mongoose.Schema({
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
            read: [{
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                read: {
                    type: Number,
                    default: 1
                }
            }]
        }
    ]

}, {
    timestamps: true
}, {
    collection: 'groupChat'
});

module.exports = mongoose.model('groupChat', groupChatSchema);