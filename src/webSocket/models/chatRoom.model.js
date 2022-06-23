const mongoose = require("mongoose");

const chatRoomSchema = mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

}, {
    timestamps: true
}, {
    collection: 'chatRoom'
});

module.exports = mongoose.model('chatRoom', chatRoomSchema);