const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { setTimer } = require('../helpers/timer');
const { onUnknownError } = require('../helpers/on-unknown-error');
const getUsername = require('../helpers/username');
const { GREETING, FEEDBACK } = require('./types');

const stepHandler = getComplexStepHandler([GREETING]);

stepHandler.on('message', async ctx => {
    let sceneToLeave;

    try {
        const { from, text } = ctx.update.message;
        const user = getUsername(from, 'name');
        sceneToLeave = GREETING;

        await ctx.sendMessage({
            chat_id: process.env.ADMIN_TELEGRAM_ID,
            text: ctx.session.messages.feedback.message
                .replace('%1', user)
                .replace('%2', text)
        });
        await ctx.sendMessage(
            ctx.session.messages.feedback.success,
            Markup.removeKeyboard()
        );

        sceneToLeave = FEEDBACK;

        return await setTimer(ctx, sceneToLeave);
    } catch (e) {
        return await onUnknownError(ctx, e);
    }
});

const Feedback = new WizardScene(
    FEEDBACK,
    async ctx => {
        try {
            await ctx.sendMessage(
                ctx.session.messages.feedback.description.title +
                    ctx.session.messages.feedback.description.points,
                Markup.inlineKeyboard([
                    Markup.button.callback(
                        ctx.session.messages.actions.home,
                        GREETING
                    )
                ])
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    stepHandler
);

module.exports = Feedback;
