const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../../models/wish');
const Give = require('../../models/give');
const { setTimer } = require('../../helpers/timer');
const { WISHLIST_REMOVE, WISHLIST } = require('../types');

const Remove = new WizardScene(WISHLIST_REMOVE, async ctx => {
    const wishId = ctx.session.wishToRemove;

    if (wishId) {
        delete ctx.session.wishToRemove;

        await Wish.findByIdAndDelete(wishId);
        await Give.deleteMany({
            wishId
        });
        await ctx.sendMessage(
            ctx.session.messages.wishlist.remove.success,
            Markup.removeKeyboard()
        );
    } else {
        await ctx.sendMessage(
            ctx.session.messages.errors.unknown,
            Markup.removeKeyboard()
        );
    }

    return await setTimer(ctx, WISHLIST);
});

module.exports = Remove;
