const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../../models/wish');
const Give = require('../../models/give');
const { setTimer, resetTimer } = require('../../helpers/timer');
const { onUnknownError } = require('../../helpers/on-unknown-error');
const { WISHLIST_REMOVE, WISHLIST } = require('../types');
const { YES, NO } = {
    YES: 'yes',
    NO: 'no'
};

const Remove = new WizardScene(
    WISHLIST_REMOVE,
    async ctx => {
        try {
            if (!ctx.session.wishToRemove) {
                await ctx.sendMessage(
                    ctx.session.messages.errors.unknown,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST);
            }

            await ctx.sendMessage(
                ctx.session.messages.wishlist.remove.confirm,
                Markup.inlineKeyboard([
                    Markup.button.callback(
                        ctx.session.messages.actions.yes,
                        YES
                    ),
                    Markup.button.callback(ctx.session.messages.actions.no, NO)
                ])
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    async ctx => {
        try {
            const callback = ctx.update?.callback_query?.data;
            const wishId = ctx.session.wishToRemove;

            await resetTimer(ctx);

            if (!callback) {
                try {
                    await ctx.sendMessage(
                        ctx.session.messages.errors.unknown,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST);
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            }

            delete ctx.session.wishToRemove;

            await Wish.findByIdAndUpdate(wishId, {
                removed: true,
                done: callback === YES
            });
            await Give.deleteMany({
                wishId
            });
            await ctx.sendMessage(
                ctx.session.messages.wishlist.remove.success,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST);
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    }
);

module.exports = Remove;
