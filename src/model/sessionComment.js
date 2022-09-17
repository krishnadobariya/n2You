const mongoose = require("mongoose");

const sessionCommentSchema = mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    cretedSessionUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    joinUser: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        status: {
            type: Number
        }
    }],
    commentWithUser: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        comment: {
            type: String,
        },
        userName: {
            type: String,
        },
        profile: {
            type: String,
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'SessionComment'
});

module.exports = mongoose.model('SessionComment', sessionCommentSchema);
