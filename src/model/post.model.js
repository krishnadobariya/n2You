const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        ref: 'User',
        required: true
    },
    posts: [{
        post: {
            type: Array
        },
        description: {
            type: String,
            require: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    }],

}, {
    timestamps: true
}, {
    collection: 'Post'
});

module.exports = mongoose.model('Post', postSchema);