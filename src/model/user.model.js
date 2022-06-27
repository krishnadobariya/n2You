const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = mongoose.Schema({
    polyDating: {
        type: String,
        require: true
    },
    HowDoYouPoly: {
        type: String,
        require: true
    },
    loveToGive: {
        type: String,
        require: true
    },
    polyRelationship: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false
        }
    },
    firstName: {
        type: String,
        require: true
    },
    birthDate: {
        type: String,
        require: true
    },
    identity: {
        type: String,
        require: true
    },
    relationshipSatus: {
        type: String,
        require: true
    },
    IntrestedIn: {
        type: String,
        require: true
    },
    Bio: {
        type: String,
        require: true
    },
    photo: {
        type: Array,
        require: true
    },
    hopingToFind: {
        type: String,
        require: true
    },
    jobTitle: {
        type: String,
        require: true
    },
    wantChildren: {
        type: Boolean,
        require: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    fcm_token: {
        type: String
    },
    location: {
        type: Object,
        default: {
            type: "Point",
            coordinates: [0.0, 0.0],
        },
        index: '2dsphere'
    },
    extraAtrribute: {
        bodyType: {
            type: String,
            require: true
        },
        height: {
            type: Number,
            require: true
        },
        smoking: {
            type: String,
            require: true
        },
        drinking: {
            type: String,
            require: true
        },
        hobbies: {
            type: String,
            require: true
        }

    },

}, {
    timestamps: true
}, {
    collection: 'User'
});

module.exports = mongoose.model('User', userSchema);