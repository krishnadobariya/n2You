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
    countJoinUser: {
        type: Number,
        default: 0
    },
    cretedSessionUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createUserIntId:{
        type: Number
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
        P1IntId : {
            type: Number,
            default: 0000
        },
        participants_2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        P2IntId : {
            type: Number,
            default: 0000
        },
        participants_3: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        P3IntId : {
            type: Number,
            default: 0000
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
