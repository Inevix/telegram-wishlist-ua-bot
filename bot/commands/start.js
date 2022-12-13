const bot = require('../bot');

bot.start(async ctx => {
    await ctx.sendMessage('Start');
    await ctx.scene.enter('greeting');
});

bot.command('start', async ctx => {
    await ctx.sendMessage('Start');
    await ctx.scene.enter('greeting');
});

module.exports = bot;
