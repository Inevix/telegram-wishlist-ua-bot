const connectDb = require('./connect-db');
const bot = require('./bot');
const { getTime } = require('./helpers/get-time');

const handleSignal = signal => {
    console.log(`Received ${signal} ${getTime()}`);
    bot.stop(signal);
};

async function launchBot() {
    await connectDb();
    process.once('SIGINT', () => handleSignal('SIGINT'));
    process.once('SIGTERM', () => handleSignal('SIGTERM'));
    console.log(`Bot started ${getTime()}`);
    await bot.launch();
}

launchBot();
