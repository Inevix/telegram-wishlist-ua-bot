const { join } = require('path');
const { NODE_ENV } = process.env;

let envPath = '.env';

if (NODE_ENV === 'dev') {
    envPath = `${envPath}.${NODE_ENV}`;
}

require('dotenv').config({
    path: join(__dirname, '..', 'env', envPath)
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
