const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const Wish = require('../../models/wish');
const trim = require('../../helpers/trim');
const getWishMarkup = require('../../helpers/wish-markup');
const getMediaGroup = require('../../helpers/media-group');
const { resetTimer, setTimer } = require('../../helpers/timer');
const { onUnknownError } = require('../../helpers/on-unknown-error');
const {
    getCutText,
    textLimits,
    textLimitTypes
} = require('../../helpers/cut-text');
const { WISHLIST_EDIT, WISHLIST, GREETING, WISHLIST_ADD } = require('../types');
const { TITLE, DESCRIPTION, IMAGES, LINK, PRIORITY, VISIBILITY, BACK } = {
    TITLE: 'title',
    DESCRIPTION: 'description',
    IMAGES: 'images',
    LINK: 'link',
    PRIORITY: 'priority',
    VISIBILITY: 'visibility',
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

        const wish = await Wish.findById(wishId);

        if (!wish) {
            delete ctx.session.wishToEdit;

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

        ctx.scene.session.wish = wish;

        const markup = await getWishMarkup(ctx, wish, false, false, true);
        const keyboard = wish.link
            ? Markup.inlineKeyboard([
                  Markup.button.url(
                      ctx.session.messages.actions.open,
                      wish.link
                  )
              ])
            : Markup.removeKeyboard();

        try {
            if (wish.images.length > 1) {
                await ctx.sendMediaGroup(getMediaGroup(wish.images));
            } else if (wish.images.length === 1) {
                await ctx.sendPhoto(wish.images[0], {
                    caption: markup,
                    parse_mode: 'MarkdownV2',
                    ...keyboard
                });
            }

            if (wish.images.length !== 1) {
                await ctx.sendMessage(markup, {
                    ...keyboard,
                    parse_mode: 'MarkdownV2'
                });
            }

            await ctx.sendMessage(
                ctx.session.messages.wishlist.edit.description,
                {
                    ...Markup.inlineKeyboard(
                        [
                            Markup.button.callback(
                                ctx.session.messages.wishlist.edit.actions
                                    .title,
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
                                wish.link
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
                                wish.hidden
                                    ? ctx.session.messages.wishlist.edit.actions
                                          .show
                                    : ctx.session.messages.wishlist.edit.actions
                                          .hide,
                                VISIBILITY
                            ),
                            Markup.button.callback(
                                ctx.session.messages.wishlist.add.title,
                                WISHLIST_ADD
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
                    ),
                    parse_mode: 'MarkdownV2'
                }
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    async ctx => {
        const callback = ctx.update?.callback_query?.data;

        await resetTimer(ctx);

        if (!callback) {
            try {
                await ctx.sendMessage(
                    ctx.session.messages.errors.unknown,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, WISHLIST_EDIT);
            } catch (e) {
                return await onUnknownError(ctx, e);
            }
        }

        ctx.scene.session.callback = callback;

        switch (callback) {
            case TITLE:
                try {
                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.scenes.title.replace(
                            '%1',
                            textLimits[textLimitTypes.TITLE]
                        ),
                        Markup.removeKeyboard()
                    );

                    return ctx.wizard.next();
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case DESCRIPTION:
                try {
                    if (ctx.scene.session.wish.description) {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.scenes.updateDescription.replace(
                                '%1',
                                textLimits[textLimitTypes.DESCRIPTION]
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
                                textLimits[textLimitTypes.DESCRIPTION]
                            ),
                            Markup.removeKeyboard()
                        );
                    }

                    return ctx.wizard.next();
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case IMAGES:
                try {
                    if (ctx.scene.session.wish.images.length) {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.scenes
                                .updateImages,
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
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case LINK:
                try {
                    if (ctx.scene.session.wish.link) {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.scenes
                                .updateLink,
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
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case PRIORITY:
                try {
                    await ctx.scene.session.wish.updateOne({
                        priority: !ctx.scene.session.wish.priority
                    });

                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.success.priority +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case VISIBILITY:
                try {
                    await ctx.scene.session.wish.updateOne({
                        hidden: !ctx.scene.session.wish.hidden
                    });

                    await ctx.sendMessage(
                        ctx.session.messages.wishlist.edit.success.visibility +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case WISHLIST_ADD:
                delete ctx.session.wishToEdit;

                return await ctx.scene.enter(WISHLIST_ADD);
            case BACK:
                delete ctx.session.wishToEdit;

                return await ctx.scene.enter(WISHLIST);
            case GREETING:
                delete ctx.session.wishToEdit;

                return await ctx.scene.enter(GREETING);
            default:
                try {
                    await ctx.sendMessage(
                        ctx.session.messages.errors.unknown,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
        }
    },
    async ctx => {
        const textAnswer = ctx.update?.message?.text;

        switch (ctx.scene.session.callback) {
            case TITLE:
                try {
                    if (
                        !textAnswer ||
                        !trim(textAnswer) ||
                        trim(textAnswer).length >
                            textLimits[textLimitTypes.TITLE]
                    ) {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.errors.title
                                .general +
                                ctx.session.messages.wishlist.edit.back,
                            Markup.removeKeyboard()
                        );

                        return await setTimer(ctx, WISHLIST_EDIT);
                    } else if (textAnswer.contains('http')) {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.errors.title
                                .link + ctx.session.messages.wishlist.edit.back,
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
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case DESCRIPTION:
                const linksLimit = 4;

                try {
                    if (
                        !textAnswer ||
                        !trim(textAnswer) ||
                        trim(textAnswer).length >
                            textLimits[textLimitTypes.DESCRIPTION]
                    ) {
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.errors
                                .description.general +
                                ctx.session.messages.wishlist.edit.back,
                            Markup.removeKeyboard()
                        );

                        return await setTimer(ctx, WISHLIST_EDIT);
                    } else if (
                        textAnswer.match(/http/gi)?.length > linksLimit
                    ) {
                        /**
                         * Telegraph API doesn't allow to contain more than 6 links.
                         * So we limit it to 4 links only for description,
                         * 'cause we need to add 2 more links:
                         * 1. for the wish link even if it doesn't exist
                         * 2. and footer copyright.
                         */
                        await ctx.sendMessage(
                            ctx.session.messages.wishlist.edit.errors.description.links.replace(
                                '%1',
                                linksLimit
                            ) + ctx.session.messages.wishlist.edit.back,
                            Markup.removeKeyboard()
                        );

                        return await setTimer(ctx, WISHLIST_EDIT);
                    }

                    await ctx.scene.session.wish.updateOne({
                        description:
                            textAnswer === ctx.session.messages.actions.remove
                                ? null
                                : getCutText(
                                      textAnswer,
                                      textLimitTypes.DESCRIPTION
                                  )
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
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case IMAGES:
                try {
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
                            ctx.session.messages.wishlist.edit.errors
                                .updateImages +
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

                    const wish = await Wish.findById(
                        ctx.scene.session.wish._id
                    );
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
                        ctx.session.messages.wishlist.edit.success
                            .updateImages +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            case LINK:
                try {
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
                                : textAnswer.replace(
                                      new RegExp('.*?(http)', 's'),
                                      '$1'
                                  )
                    });
                    await ctx.sendMessage(
                        (textAnswer === ctx.session.messages.actions.remove
                            ? ctx.session.messages.wishlist.edit.success
                                  .removeLink
                            : ctx.session.messages.wishlist.edit.success
                                  .updateLink) +
                            ctx.session.messages.wishlist.edit.back,
                        Markup.removeKeyboard()
                    );

                    return await setTimer(ctx, WISHLIST_EDIT);
                } catch (e) {
                    return await onUnknownError(ctx, e);
                }
            default:
                delete ctx.session.wishToEdit;

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
    }
);

module.exports = Edit;
