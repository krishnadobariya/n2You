const mongoose = require("mongoose");

const thumbDownSchema = mongoose.Schema({
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
    collection: 'thumbDown'
});

module.exports = mongoose.model('thumbDown', thumbDownSchema);
