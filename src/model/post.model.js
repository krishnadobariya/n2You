const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    uesrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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