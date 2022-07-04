const mongoose = require("mongoose");

const groupChatRoomSchema = mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user3: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user4: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user5: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user6: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user7: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user8: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true
}, {
    collection: 'groupChatRoom'
});

module.exports = mongoose.model('groupChatRoom', groupChatRoomSchema);