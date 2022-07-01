const mongoose = require("mongoose");

const matchUserSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    allMatches: [{
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'matchUser'
});

module.exports = mongoose.model('matchUser', matchUserSchema);