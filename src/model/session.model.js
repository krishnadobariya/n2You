const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
    selectedDate: {
        type: String
    },
    selectedTime: {
        type: String
    },
    cretedSessionUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
        participants_4: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
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