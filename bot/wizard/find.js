const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const { resetTimer } = require('../helpers/timer');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { GREETING, FIND_LIST, THIRD_WISHLIST } = require('./types');

const stepHandler = getComplexStepHandler([GREETING]);

stepHandler.on('message', async ctx => {
    const thirdWishlist = ctx.update?.message?.text ?? '';

    if (
        ctx.session.thirdWishlist &&
        ctx.session.thirdWishlist !== thirdWishlist
    ) {
        delete ctx.session.thirdWishlistFilter;
    }

    ctx.session.thirdWishlist = thirdWishlist;

    return await ctx.scene.enter(THIRD_WISHLIST);
});

const Find = new WizardScene(
    FIND_LIST,
    async ctx => {
        await resetTimer(ctx);

        delete ctx.session.thirdWishlist;

        try {
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
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    stepHandler
);

module.exports = Find;
