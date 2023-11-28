const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../../models/wish');
const trim = require('../../helpers/trim');
const removeKeyboard = require('../../helpers/remove-keyboard');
const { setTimer } = require('../../helpers/timer');
const { textLimits, textLimitTypes } = require('../../helpers/cut-text');
const { onUnknownError } = require('../../helpers/on-unknown-error');
const { GREETING, WISHLIST, WISHLIST_ADD, WISHLIST_EDIT } = require('../types');
const { BACK } = {
    BACK: 'back'
};

const Add = new WizardScene(
    WISHLIST_ADD,
    async ctx => {
        try {
            await ctx.sendMessage(
                ctx.session.messages.wishlist.add.description.replace(
                    '%1',
                    textLimits[textLimitTypes.TITLE]
                ),
                Markup.inlineKeyboard(
                    [
                        Markup.button.callback(
                            ctx.session.messages.actions.back,
                            BACK
                        ),
                        Markup.button.callback(
                            ctx.session.messages.actions.home,
                            GREETING
                        )
                    ],
                    {
                        columns: 1
                    }
                )
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    async ctx => {
        const callback = ctx.update?.callback_query?.data ?? null;
        let message = ctx.update?.message?.text ?? '';

        if (callback) {
            await removeKeyboard(ctx);

            return await ctx.scene.enter(
                callback === BACK ? WISHLIST : GREETING
            );
        }

        if (
            !message ||
            (message &&
                !trim(message) &&
                trim(message).length > textLimits[textLimitTypes.TITLE])
        ) {
            try {
                await ctx.sendMessage(
                    ctx.session.messages.wishlist.add.error,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_ADD);
            } catch (e) {
                return await onUnknownError(ctx, e);
            }
        }

        try {
            const wish = await new Wish({
                userId: ctx.session.user._id,
                title: message
            });

            await wish.save();

            ctx.session.wishToEdit = wish._id;

            await ctx.sendMessage(
                ctx.session.messages.wishlist.add.success,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST_EDIT);
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    }
);

module.exports = Add;
