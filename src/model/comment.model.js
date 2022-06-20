const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
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
        replyUser: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            replyMesage: {
                type: String
            }
        }]
    }]
}, {
    timestamps: true
}, {
    collection: 'Comments'
});

module.exports = mongoose.model('Comments', commentSchema);