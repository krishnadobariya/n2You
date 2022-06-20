const mongoose = require("mongoose");

const blockUserSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockUnblockUser: [{
        blockUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        blockUnblock: {
            type: Number,
            require: true
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'blockUnblock'
})

module.exports = mongoose.model('blockUnblock', blockUserSchema);