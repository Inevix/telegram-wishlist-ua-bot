const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../../models/wish');
const trim = require('../../helpers/trim');
const removeKeyboard = require('../../helpers/remove-keyboard');
const { setTimer } = require('../../helpers/timer');
const { GREETING, WISHLIST, WISHLIST_ADD, WISHLIST_EDIT } = require('../types');
const { BACK } = {
    BACK: 'back'
};

const Add = new WizardScene(
    WISHLIST_ADD,
    async ctx => {
        await ctx.sendMessage(
            ctx.session.messages.wishlist.add.description,
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

        if (!message || (message && !trim(message))) {
            await ctx.sendMessage(
                ctx.session.messages.wishlist.add.error,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST_ADD);
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
        } catch (e) {
            await ctx.sendMessage(
                ctx.session.messages.errors.unknown,
                Markup.removeKeyboard()
            );
        }

        return await setTimer(ctx, WISHLIST_EDIT);
    }
);

module.exports = Add;
