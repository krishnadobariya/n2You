const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: {
        type: Array
    }
}, {
    timestamps: true
}, {
    collection: 'Post'
});

module.exports = mongoose.model('Post', postSchema);