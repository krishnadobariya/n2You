const mongoose = require("mongoose");

const suparMatchSchema = mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    matchUserId:[{
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
}, {
    timestamps: true
}, {
    collection: 'suparMatch'
});


module.exports = mongoose.model('suparMatch', suparMatchSchema);
