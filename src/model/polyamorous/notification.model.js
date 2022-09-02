const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notifications: [{
        notifications: {
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: Number
        },
        read: {
            type: Number,
            default: 1
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'notification'
})

module.exports = mongoose.model('notification', notificationSchema);