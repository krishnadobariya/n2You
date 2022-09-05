const mongoose = require("mongoose");

const videoCallSchema = mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    accepted: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
}, {
    collection: 'videoCall'
});

module.exports = mongoose.model('videoCall', videoCallSchema);