const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null, // The unique constraint is not applied here
    },
    email: {
        type: String,
        required: true,
        unique: true // Email is still unique
    },
    password: {
        type: String,
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false,
    }
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
