const mongoose = require("mongoose");

const thumbUpSchema = mongoose.Schema({
    adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thumbDetail: [{
        reqUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    }]
}, {
    timestamps: true
}, {
    collection: 'thumbUp'
});

module.exports = mongoose.model('thumbUp', thumbUpSchema);
