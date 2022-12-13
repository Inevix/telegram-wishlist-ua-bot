const { Composer } = require('telegraf');
const removeKeyboard = require('./remove-keyboard');

module.exports = (callbacks = []) => {
    const stepHandler = new Composer();

    for (const callback of callbacks) {
        stepHandler.action(callback, async ctx => {
            await removeKeyboard(ctx);
            await ctx.scene.enter(callback);
        });
    }

    return stepHandler;
};
