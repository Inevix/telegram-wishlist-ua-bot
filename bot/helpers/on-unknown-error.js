const { Markup } = require('telegraf');
const { getTime } = require('./get-time');

const onUnknownError = async (ctx, exception) => {
    const errorTime = getTime();

    if (exception.response.error_code === 403) {
        console.log('Error Time:', errorTime);

        return console.error(exception);
    }

    try {
        await ctx.sendMessage(
            ctx.session.messages.errors.unknown,
            Markup.removeKeyboard()
        );
    } catch (e) {
        console.log('Error Time:', errorTime);
        console.error(e);
    }
};

module.exports = {
    onUnknownError
};
