const mongoose = require("mongoose");

const rejectListSchema = mongoose.Schema({
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
    collection: 'rejectList'
});


module.exports = mongoose.model('rejectList', rejectListSchema);
