const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = mongoose.Schema({
    polyDating: {
        type: Number,
        require: true
    },
    HowDoYouPoly: {
        type: String,
    },
    loveToGive: {
        type: String,
    },
    polyRelationship: {
        type: String,
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
        type: Number,
        require: true
    },
    relationshipSatus: {
        type: Number,
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
    countryCode: {
        type: String,
        required: true,
    },
    fcm_token: {
        type: String
    },
    yesBasket: [
        {
            match: {
                type: Number
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId
            },
            thumbUp: {
                type: Number,
                default: 0
            },
            thumbDown: {
                type: Number,
                default: 0
            }
        }
    ],
    noBasket: [
        {
            match: {
                type: Number
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId
            },
            thumbUp: {
                type: Number,
                default: 0
            },
            thumbDown: {
                type: Number,
                default: 0
            }
        }
    ],
    linkProfile: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId
            },
            accepted: {
                type: Number,
                default: 0
            },
            status: {
                type: Number,
                default: 0
            },
            combineId: {
                type: mongoose.Schema.Types.ObjectId
            }
        },],
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
    password: {
        type: String,
        required: true
    }

}, {
    timestamps: true
}, {
    collection: 'User'
});

module.exports = mongoose.model('User', userSchema);