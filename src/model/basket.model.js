const mongoose = require("mongoose");

const basketSchema = mongoose.Schema({
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
    }

}, {
    timestamps: true
}, {
    collection: 'basket'
})


module.exports = mongoose.model('basket', basketSchema);