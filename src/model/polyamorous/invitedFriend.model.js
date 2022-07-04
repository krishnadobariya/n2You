const mongoose = require("mongoose");

const invitedFriendSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    invitedFriends: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }]
}, {
    timestamps: true
}, {
    collection: 'inviredFriends'
})

module.exports = mongoose.model('inviredFriends', invitedFriendSchema);
