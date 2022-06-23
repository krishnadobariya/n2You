const mongoose = require("mongoose");

const chatRoomSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',

    },
    requestedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
}, {
    collection: 'chatRoom'
});

module.exports = mongoose.model('chatRoom', chatRoomSchema);