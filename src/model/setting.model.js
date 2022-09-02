const mongoose = require("mongoose");

const settingSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullAccess: {
        type: Boolean,
        default: true
    },
    thumpsUpAndDown: {
        type: Boolean,
        default: false
    },
    commentAccess: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
}, {
    collection: 'setting'
})


module.exports = mongoose.model('setting', settingSchema);