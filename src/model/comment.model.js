const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        date: {
            type: String,
            default: "0 second"
        },
        replyUser: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            replyMessage: {
                type: String
            },
            date: {
                type: String,
                default: "0 second"
            }
        }]
    }]
}, {
    timestamps: true
}, {
    collection: 'Comments'
});

module.exports = mongoose.model('Comments', commentSchema);