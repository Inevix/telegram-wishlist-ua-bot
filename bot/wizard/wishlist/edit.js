const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../../models/wish');
const trim = require('../../helpers/trim');
const getWishMarkup = require('../../helpers/wish-markup');
const getMediaGroup = require('../../helpers/media-group');
const { resetTimer, setTimer } = require('../../helpers/timer');
const {
    getCutText,
    textLimits,
    textLimitTypes
} = require('../../helpers/cut-text');
const { WISHLIST_EDIT, WISHLIST, GREETING } = require('../types');
const { TITLE, DESCRIPTION, IMAGES, LINK, PRIORITY, BACK } = {
    TITLE: 'title',
    DESCRIPTION: 'description',
    IMAGES: 'images',
    LINK: 'link',
    PRIORITY: 'priority',
    BACK: 'back'
};

const Edit = new WizardScene(
    WISHLIST_EDIT,
    async ctx => {
        const wishId = ctx.session.wishToEdit;

        await resetTimer(ctx);

        delete ctx.scene.session.images;

        if (!wishId) {
            delete ctx.session.wishToEdit;

            await ctx.sendMessage(
                ctx.session.messages.errors.unknown,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST);
        }

        const wish = await Wish.findById(wishId);

        if (!wish) {
            delete ctx.session.wishToEdit;

            await ctx.sendMessage(
                ctx.session.messages.errors.unknown,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST);
        }

        ctx.scene.session.wish = wish;

        const markup = await getWishMarkup(ctx, wish);
        const keyboard = wish.link
            ? Markup.inlineKeyboard([
                  Markup.button.url(
                      ctx.session.messages.actions.open,
                      wish.link
                  )
              ])
            : Markup.removeKeyboard();

        if (wish.images.length > 1) {
            await ctx.sendMediaGroup(getMediaGroup(wish.images));
        } else if (wish.images.length === 1) {
            await ctx.sendPhoto(wish.images[0], {
                caption: markup,
                parse_mode: 'Markdown',
                ...keyboard
            });
        }

        if (wish.images.length !== 1) {
            await ctx.replyWithMarkdown(markup, keyboard);
        }

        await ctx.sendMessage(
            ctx.session.messages.wishlist.edit.description,
            Markup.inlineKeyboard(
                [
                    Markup.button.callback(
                        ctx.session.messages.wishlist.edit.actions.title,
                        TITLE
                    ),
                    Markup.button.callback(
                        wish.description
                            ? ctx.session.messages.wishlist.edit.actions
                                  .updateDescription
                            : ctx.session.messages.wishlist.edit.actions
                                  .addDescription,
                        DESCRIPTION
                    ),
                    Markup.button.callback(
                        wish.images.length
                            ? ctx.session.messages.wishlist.edit.actions
                                  .updateImages
                            : ctx.session.messages.wishlist.edit.actions
                                  .addImages,
                        IMAGES
                    ),
                    Markup.button.callback(
                        wish.description
                            ? ctx.session.messages.wishlist.edit.actions
                                  .updateLink
                            : ctx.session.messages.wishlist.edit.actions
                                  .addLink,
                        LINK
                    ),
                    Markup.button.callback(
                        wish.priority
                            ? ctx.session.messages.wishlist.edit.actions
                                  .unsetPriority
                            : ctx.session.messages.wishlist.edit.actions
                                  .setPriority,
                        PRIORITY
                    ),
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
        const callback = ctx.update?.callback_query?.data;

        await resetTimer(ctx);

        if (!callback) {
            await ctx.sendMessage(
                ctx.session.messages.errors.unknown,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, WISHLIST_EDIT);
        }

        ctx.scene.session.callback = callback;

        switch (callback) {
            case TITLE:
                await ctx.sendMessage(
                    ctx.session.messages.wishlist.edit.scenes.title.replace(
                        '%1',
                        textLimits.TITLE
                    ),
                    Markup.removeKeyboard()
                );

                return ctx.wizard.next();
            case DESCRIPTION:
                if (ctx.scene.session.wish.description) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.updateDescription.replace(
                            '%1',
                            textLimits.DESCRIPTION
                        ),
                        Markup.keyboard([
                            Markup.button.text(
                                ctx.session.messages.actions.remove
                            )
                        ])
                    );
                } else {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.addDescription.replace(
                            '%1',
                            textLimits.DESCRIPTION
                        ),
                        Markup.removeKeyboard()
                    );
                }

                return ctx.wizard.next();
            case IMAGES:
                if (ctx.scene.session.wish.images.length) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.updateImages,
                        Markup.keyboard([
                            Markup.button.text(
                                ctx.session.messages.actions.remove
                            )
                        ])
                    );
                } else {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.addImages,
                        Markup.removeKeyboard()
                    );
                }

                return ctx.wizard.next();
            case LINK:
                if (ctx.scene.session.wish.link) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.updateLink,
                        Markup.keyboard([
                            Markup.button.text(
                                ctx.session.messages.actions.remove
                            )
                        ])
                    );
                } else {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.addLink,
                        Markup.removeKeyboard()
                    );
                }

                return ctx.wizard.next();
            case PRIORITY:
                await ctx.scene.session.wish.updateOne({
                    priority: !ctx.scene.session.wish.priority
                });

                await ctx.sendMessage(
                    ctx.session.messages.wishlist.edit.success.priority +
                        ctx.session.messages.wishlist.edit.back,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
            case BACK:
                delete ctx.session.wishToEdit;

                return await ctx.scene.enter(WISHLIST);
            case GREETING:
                delete ctx.session.wishToEdit;

                return await ctx.scene.enter(GREETING);
            default:
                await ctx.sendMessage(
                    ctx.session.messages.errors.unknown,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
        }
    },
    async ctx => {
        const textAnswer = ctx.update?.message?.text;

        switch (ctx.scene.session.callback) {
            case TITLE:
                if (
                    !textAnswer ||
                    !trim(textAnswer) ||
                    trim(textAnswer).length > textLimits.TITLE
                ) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.errors.title +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                }

                await ctx.scene.session.wish.updateOne({
                    title: getCutText(textAnswer)
                });
                await ctx.sendMessage(
                    ctx.session.messages.wishlist.edit.success.title +
                        ctx.session.messages.wishlist.edit.back,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
            case DESCRIPTION:
                if (
                    !textAnswer ||
                    !trim(textAnswer) ||
                    trim(textAnswer).length > textLimits.DESCRIPTION
                ) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.errors.description +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                }

                await ctx.scene.session.wish.updateOne({
                    description:
                        textAnswer === ctx.session.messages.actions.remove
                            ? null
                            : getCutText(textAnswer, textLimitTypes.DESCRIPTION)
                });
                await ctx.sendMessage(
                    (textAnswer === ctx.session.messages.actions.remove
                        ? ctx.session.messages.wishlist.edit.success
                              .removeDescription
                        : ctx.session.messages.wishlist.edit.success
                              .updateDescription) +
                        ctx.session.messages.wishlist.edit.back,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
            case IMAGES:
                if (
                    textAnswer &&
                    textAnswer === ctx.session.messages.actions.remove
                ) {
                    if (ctx.scene.session.wish.images.length) {
                        await ctx.deleteMessage();
                        await ctx.scene.session.wish.updateOne({
                            images: []
                        });
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.success
                                .removeImages +
                                ctx.session.messages.wishlist.edit.back,
                            Markup.removeKeyboard()
                        );
                    } else {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.errors
                                .removeImages +
                                ctx.session.messages.wishlist.edit.back,
                            Markup.removeKeyboard()
                        );
                    }

                    return await setTimer(ctx, WISHLIST_EDIT);
                }

                const contextImages = ctx.update?.message?.photo ?? [];

                if (!contextImages.length) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.errors.updateImages +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                }

                let originalImage = contextImages[0];

                for (const image of contextImages) {
                    if (
                        originalImage.width > image.width &&
                        originalImage.height > image.height
                    ) {
                        continue;
                    }

                    originalImage = image;
                }

                if (!ctx.scene.session.images) {
                    ctx.scene.session.images = {};
                }

                if (originalImage.file_id) {
                    ctx.scene.session.images[originalImage.file_id] = true;
                }

                const wish = await Wish.findById(ctx.scene.session.wish._id);
                const telegramMediaGroupLimitation = 9;
                const images = [
                    ...new Set([
                        ...wish.images,
                        ...Object.keys(ctx.scene.session.images)
                    ])
                ].filter(image => typeof image === 'string');

                if (images.length > telegramMediaGroupLimitation) {
                    images.length = telegramMediaGroupLimitation;
                }

                await ctx.scene.session.wish.updateOne({
                    images
                });

                await ctx.sendMessage(
                    ctx.session.messages.wishlist.edit.success.updateImages +
                        ctx.session.messages.wishlist.edit.back,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
            case LINK:
                if (
                    !textAnswer ||
                    !trim(textAnswer) ||
                    !textAnswer.match(
                        new RegExp(
                            `http|${ctx.session.messages.actions.remove}`
                        )
                    )
                ) {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.errors.link,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                }

                await ctx.scene.session.wish.updateOne({
                    link:
                        textAnswer === ctx.session.messages.actions.remove
                            ? null
                            : textAnswer
                });
                await ctx.sendMessage(
                    (textAnswer === ctx.session.messages.actions.remove
                        ? ctx.session.messages.wishlist.edit.success.removeLink
                        : ctx.session.messages.wishlist.edit.success
                              .updateLink) +
                        ctx.session.messages.wishlist.edit.back,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
            default:
                delete ctx.session.wishToEdit;

                await ctx.sendMessage(
                    ctx.session.messages.errors.unknown,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST);
        }
    }
);

module.exports = Edit;
