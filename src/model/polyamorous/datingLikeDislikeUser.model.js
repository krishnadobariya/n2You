const mongoose = require("mongoose");
const datingLikeDislikeUserSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    LikeUser: [{
        LikeduserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    }],
    disLikeUser: [{
        disLikeduserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'datingLikeDislikeUser'
});

module.exports = mongoose.model('datingLikeDislikeUser', datingLikeDislikeUserSchema);