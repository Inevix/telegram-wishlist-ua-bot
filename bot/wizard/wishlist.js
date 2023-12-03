const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../models/wish');
const Give = require('../models/give');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const getWishMarkup = require('../helpers/wish-markup');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { setTimer } = require('../helpers/timer');
const share = require('../helpers/share');
const {
    GREETING,
    WISHLIST,
    WISHLIST_ADD,
    WISHLIST_EDIT,
    WISHLIST_REMOVE
} = require('./types');
const { EDIT, REMOVE, CLEAN, SHARE } = {
    EDIT: 'edit_',
    REMOVE: 'remove_',
    CLEAN: 'clean',
    SHARE: 'share'
};

const stepHandler = getComplexStepHandler([GREETING, WISHLIST, WISHLIST_ADD]);

stepHandler.action(new RegExp(`${EDIT}`), async ctx => {
    ctx.session.wishToEdit = ctx.update.callback_query.data.replace(EDIT, '');

    await ctx.scene.enter(WISHLIST_EDIT);
});

stepHandler.action(new RegExp(`${REMOVE}`), async ctx => {
    ctx.session.wishToRemove = ctx.update.callback_query.data.replace(
        REMOVE,
        ''
    );

    return await ctx.scene.enter(WISHLIST_REMOVE);
});

stepHandler.action(CLEAN, async ctx => {
    try {
        const wishlist = await Wish.find({ userId: ctx.session.user._id });

        if (!wishlist.length) {
            await ctx.sendMessage(
                ctx.session.messages.wishlist.clean.error,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST);
        }

        for await (const wish of wishlist) {
            await Give.findOneAndDelete({
                wishId: wish._id
            });
        }

        await Wish.deleteMany({
            userId: ctx.session.user._id
        });

        await ctx.sendMessage(
            ctx.session.messages.wishlist.clean.success,
            Markup.removeKeyboard()
        );

        return await setTimer(ctx, WISHLIST);
    } catch (e) {
        return await onUnknownError(ctx, e);
    }
});

stepHandler.action(SHARE, async ctx => {
    await share(ctx);
});

const Wishlist = new WizardScene(
    WISHLIST,
    async ctx => {
        try {
            const wishlist = await Wish.find({
                userId: ctx.session.user._id,
                done: false
            }).sort({
                priority: -1,
                updatedAt: -1
            });
            const buttons = [
                Markup.button.callback(
                    ctx.session.messages.wishlist.add.title,
                    WISHLIST_ADD
                )
            ];

            if (wishlist.length) {
                buttons.push(
                    Markup.button.callback(
                        ctx.session.messages.actions.clean,
                        CLEAN
                    )
                );
                buttons.push(
                    Markup.button.callback(
                        ctx.session.messages.actions.share,
                        SHARE
                    )
                );
            }

            buttons.push(
                Markup.button.callback(
                    ctx.session.messages.actions.home,
                    GREETING
                )
            );

            if (!wishlist.length) {
                await ctx.sendMessage(
                    ctx.session.messages.wishlist.empty,
                    Markup.inlineKeyboard(buttons, {
                        columns: 1
                    })
                );

                return ctx.wizard.next();
            }

            await ctx.replyWithMarkdown(
                ctx.session.messages.wishlist.filled.before,
                Markup.removeKeyboard()
            );

            for await (const wish of wishlist) {
                const markup = await getWishMarkup(ctx, wish, true, true, true);

                if (!markup) continue;

                const buttons = [
                    Markup.button.callback(
                        ctx.session.messages.actions.edit,
                        EDIT.concat(wish._id)
                    ),
                    Markup.button.callback(
                        ctx.session.messages.actions.remove,
                        REMOVE.concat(wish._id)
                    )
                ];

                await ctx.replyWithMarkdownV2(
                    markup,
                    Markup.inlineKeyboard(buttons, {
                        columns: 2
                    })
                );
            }

            await ctx.replyWithMarkdown(
                ctx.session.messages.wishlist.filled.after,
                Markup.inlineKeyboard(buttons, {
                    columns: 1
                })
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    stepHandler
);

module.exports = Wishlist;
