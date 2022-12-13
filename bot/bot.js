const {
    Telegraf,
    Scenes: { Stage },
    session
} = require('telegraf');
const wizard = require('./wizard');
const { GREETING } = require('./wizard/types');

const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Stage([...wizard], {
    default: GREETING
});

if (process.env.NODE_ENV === 'dev') {
    bot.use(Telegraf.log());
}

bot.use(session());
bot.use(stage.middleware());
bot.catch(error => console.error(error));

module.exports = bot;
