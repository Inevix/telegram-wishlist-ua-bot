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
    currency: {
        type: String,
        default: 'UAH'
    },
    telegraphAccessToken: {
        type: String,
        default: ''
    },
    version: String,
    noticed: {
        type: Boolean,
        default: false
    },
    payments: {
        type: String,
        default: ''
    }
});

module.exports = model('User', userSchema);
