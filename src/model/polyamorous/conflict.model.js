const mongoose = require("mongoose");

const conflictSchema = mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conflictUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notAcceptedUserId: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: Number,
            default: 0
        }
    }],
    acceptedUserId: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: Number,
            default: 0
        }
    }],
    aggreeCount: {
        type: Number
    },
    disAggreeCount: {
        type: Number
    }
}, {
    timestamps: true
}, {
    collection: 'conflictOfIntrest'
})

module.exports = mongoose.model('conflictOfIntrest', conflictSchema);