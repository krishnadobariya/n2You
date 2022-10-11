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
        },
        intId: {
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
    }],
    upload: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        uploadImgOrVideo: {
            type: Array,
        },
        userName: {
            type: String,
        },
        profile: {
            type: String,
        }
    }],
    raisHand: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        mute: {
            type: Number,
            default: 0
        }
    }],
    participants: [{
        participants_1: [{
            userId: mongoose.Schema.Types.ObjectId,
            thumbUp: {
                type: Number,
                default: 0
            }
        }],
        participants_2: [{
            userId: mongoose.Schema.Types.ObjectId,
            thumbUp: {
                type: Number,
                default: 0
            }
        }],
        participants_3: [{
            userId: mongoose.Schema.Types.ObjectId,
            thumbUp: {
                type: Number,
                default: 0
            }
        }],
    }],
    liveSession: {
        participants_1: [{
            userId:
            {
                type: mongoose.Schema.Types.ObjectId,
                default: mongoose.Types.ObjectId("5f92cbf10cf217478ba93561")
            },
            allow: {
                type: Number,
                default: 0
            }
        }],
        participants_2: [{
            userId:
            {
                type: mongoose.Schema.Types.ObjectId,
                default: mongoose.Types.ObjectId("5f92cbf10cf217478ba93561")
            },
            allow: {
                type: Number,
                default: 0
            }
        }],
        participants_3: [{
            userId:
            {
                type: mongoose.Schema.Types.ObjectId,
                default: mongoose.Types.ObjectId("5f92cbf10cf217478ba93561")
            },
            allow: {
                type: Number,
                default: 0
            }
        }],
    },

    LikeSession: {
        participants_1: [{
            likeUserId:
            {
                type: mongoose.Schema.Types.ObjectId
            }
        }],
        participants_2: [{
            likeUserId:
            {
                type: mongoose.Schema.Types.ObjectId
            }
        }],
        participants_3: [{
            likeUserId:
            {
                type: mongoose.Schema.Types.ObjectId
            }
        }],
    }

}, {
    timestamps: true
}, {
    collection: 'SessionComment'
});

module.exports = mongoose.model('SessionComment', sessionCommentSchema);
