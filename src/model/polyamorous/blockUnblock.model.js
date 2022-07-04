const mongoose = require("mongoose");

const block_user_schema = mongoose.Schema({
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
    collection: 'block_user'
})

module.exports = mongoose.model('block_user', block_user_schema);