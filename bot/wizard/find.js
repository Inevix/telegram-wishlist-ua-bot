const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const { resetTimer } = require('../helpers/timer');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { GREETING, FIND_LIST, THIRD_WISHLIST } = require('./types');

const stepHandler = getComplexStepHandler([GREETING]);

stepHandler.on('message', async ctx => {
    ctx.session.thirdWishlist = ctx.update?.message?.text ?? '';

    return await ctx.scene.enter(THIRD_WISHLIST);
});

const Find = new WizardScene(
    FIND_LIST,
    async ctx => {
        await resetTimer(ctx);

        delete ctx.session.thirdWishlist;

        await ctx.replyWithMarkdown(
            ctx.session.messages.findList.description,
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

module.exports = Find;
