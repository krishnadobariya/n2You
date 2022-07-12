const mongoose = require("mongoose");

const userHistorySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relastionShipHistory: [{
        message: {
            type: "string"
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'relationship_history'
})

module.exports = mongoose.model('relationship_history', userHistorySchema);