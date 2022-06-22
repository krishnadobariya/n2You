const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    text: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
}, {
    collection: 'chat'
});

module.exports = mongoose.model('chat', chatSchema);