const mongoose = require("mongoose");

const thumbUpSessionSchema = mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
   
    thumbupUserId : [{
        userId :  mongoose.Schema.Types.ObjectId,
        participantUserId :  mongoose.Schema.Types.ObjectId,
    }]

}, {
    timestamps: true
}, {
    collection: 'thumbUpSession'
});

module.exports = mongoose.model('thumbUpSession', thumbUpSessionSchema);
