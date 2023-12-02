const { Markup } = require('telegraf');
const { getTime } = require('./get-time');

const onUnknownError = async (ctx, exception) => {
    const errorTime = getTime();

    console.log('Error Time:', errorTime);

    if (exception?.response?.error_code === 403) {
        return console.error(exception);
    }

    try {
        console.error(exception);

        await ctx.sendMessage(
            ctx.session.messages.errors.unknown,
            Markup.removeKeyboard()
        );
    } catch (e) {
        console.error(e);
    }
};

module.exports = {
    onUnknownError
};
