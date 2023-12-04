const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const User = require('../models/user');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const getMessages = require('../i18n/messages');
const {
    GREETING,
    PRIVACY,
    AUTH,
    WISHLIST,
    GIVE_LIST,
    FIND_LIST,
    FEEDBACK,
    STATS,
    DONATE
} = require('../wizard/types');
const { onUnknownError } = require('../helpers/on-unknown-error');

const stepHandler = getComplexStepHandler([
    PRIVACY,
    AUTH,
    WISHLIST,
    GIVE_LIST,
    FIND_LIST,
    FEEDBACK,
    STATS,
    DONATE
]);

const Greeting = new WizardScene(
    GREETING,
    async ctx => {
        try {
            const sessionId = ctx.session.telegramId;
            const sessionLang = ctx.session.lang;
            const messageId =
                ctx.update?.message?.from?.id ??
                ctx.update?.callback_query?.from?.id;
            const messageUsername =
                ctx.update?.message?.from?.username ??
                ctx.update?.callback_query?.from?.username;
            const messageLang =
                ctx.update?.message?.from?.language_code ??
                ctx.update?.callback_query?.from?.language_code;

            if (messageId && !sessionId) {
                ctx.session.telegramId = messageId;
            }

            if (messageLang && !sessionLang) {
                // Todo: add translations
                // ctx.session.lang = messageLang;
                ctx.session.lang = 'uk';
            }

            ctx.session.messages = getMessages(ctx.session.lang);

            const telegramId = ctx.session.telegramId ?? messageId;
            const user = await User.findOne({ telegramId });

            if (!user) {
                await ctx.sendMessage(
                    `${ctx.session.messages.greeting.general}\n\n${ctx.session.messages.greeting.guest}`,
                    {
                        ...Markup.inlineKeyboard(
                            [
                                Markup.button.callback(
                                    ctx.session.messages.auth.title.guest,
                                    AUTH
                                ),
                                Markup.button.callback(
                                    ctx.session.messages.privacy.title,
                                    PRIVACY
                                ),
                                Markup.button.callback(
                                    ctx.session.messages.feedback.title,
                                    FEEDBACK
                                ),
                                Markup.button.callback(
                                    ctx.session.messages.stats.action,
                                    STATS
                                ),
                                Markup.button.callback(
                                    ctx.session.messages.donate.title,
                                    DONATE
                                )
                            ],
                            {
                                columns: 1
                            }
                        ),
                        parse_mode: 'Markdown'
                    }
                );

                return ctx.wizard.next();
            }

            ctx.session.user = user;

            if (
                ctx.session.user.username &&
                messageUsername &&
                ctx.session.user.username !== messageUsername
            ) {
                await ctx.session.user.updateOne({
                    username: messageUsername
                });
                ctx.session.user = await User.findById(user._id);
            }

            await ctx.sendMessage(ctx.session.messages.greeting.user, {
                ...Markup.inlineKeyboard(
                    [
                        Markup.button.callback(
                            ctx.session.messages.wishlist.title,
                            WISHLIST
                        ),
                        Markup.button.callback(
                            ctx.session.messages.giveList.title,
                            GIVE_LIST
                        ),
                        Markup.button.callback(
                            ctx.session.messages.findList.title,
                            FIND_LIST
                        ),
                        Markup.button.callback(
                            ctx.session.messages.auth.title.user,
                            AUTH
                        ),
                        Markup.button.callback(
                            ctx.session.messages.privacy.title,
                            PRIVACY
                        ),
                        Markup.button.callback(
                            ctx.session.messages.feedback.title,
                            FEEDBACK
                        ),
                        Markup.button.callback(
                            ctx.session.messages.stats.action,
                            STATS
                        ),
                        Markup.button.callback(
                            ctx.session.messages.donate.title,
                            DONATE
                        )
                    ],
                    {
                        columns: 1
                    }
                ),
                parse_mode: 'Markdown'
            });

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    stepHandler
);

module.exports = Greeting;
