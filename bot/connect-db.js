const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '..', 'env', `.env.${process.env.NODE_ENV}`)
});

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

module.exports = async () => {
    try {
        await new mongoose.connect(process.env.MONGODB_URI);

        await console.log('DB successfully connected!');
        await Promise.resolve();
    } catch (e) {
        await console.error('DB connection error!');
        await Promise.reject(e);
    }
};
