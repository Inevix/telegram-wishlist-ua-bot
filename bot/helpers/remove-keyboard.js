const { Markup } = require('telegraf');

module.exports = async ctx => {
    try {
        await ctx.editMessageReplyMarkup();
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(e);
        }
    }
};
