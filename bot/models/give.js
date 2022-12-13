const { Schema, model } = require('mongoose');

module.exports = model(
    'Give',
    new Schema({
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        wishId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    })
);
