const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { setTimer } = require('../helpers/timer');
const { GREETING, FEEDBACK } = require('./types');

const stepHandler = getComplexStepHandler([GREETING]);

stepHandler.on('message', async ctx => {
    let sceneToLeave;

    try {
        const {
            from: { username, first_name, last_name },
            text
        } = ctx.update.message;
        const user = username ? `@${username}` : `${first_name} ${last_name}`;
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
    } catch (e) {
        sceneToLeave = FEEDBACK;

        await ctx.sendMessage(
            ctx.session.messages.errors.unknown,
            Markup.removeKeyboard()
        );
    }

    return await setTimer(ctx, sceneToLeave);
});

const Feedback = new WizardScene(
    FEEDBACK,
    async ctx => {
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
    },
    stepHandler
);

module.exports = Feedback;
