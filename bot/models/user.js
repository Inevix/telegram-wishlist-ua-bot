const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true,
        sparse: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    language: String,
    hideGreeting: {
        type: Boolean,
        default: false
    }
});

module.exports = model('User', userSchema);
