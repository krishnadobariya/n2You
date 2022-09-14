const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
    selectedDate: {
        type: String
    },
    selectedTime: {
        type: String
    },
    isLive: {
        type: String,
        default: true
    },
    cretedSessionUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    started: {
        type: Boolean,
        default: false
    },
    sessionEndOrNot: {
        type: Boolean,
        default: false
    },
    participants: [{
        participants_1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        participants_2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        participants_3: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    }],
    RoomType: {
        type: String
    }
}, {
    timestamps: true
}, {
    collection: 'Session'
});

module.exports = mongoose.model('Session', sessionSchema);
