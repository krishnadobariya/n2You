const mongoose = require("mongoose");

const linkProfileSchema = mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    user3: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    user4: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    active: [{
        status1: {
            type: Number,
        },
        status2: {
            type: Number,
        },
        status3: {
            type: Number,
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'linkProfile'
})

module.exports = mongoose.model('linkProfile', linkProfileSchema);
