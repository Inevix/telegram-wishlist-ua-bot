const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const User = require('../models/user');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { setTimer } = require('../helpers/timer');
const getMessages = require('../i18n/messages');
const {
    GREETING,
    PRIVACY,
    AUTH,
    WISHLIST,
    GIVE_LIST,
    FIND_LIST,
    FEEDBACK
} = require('../wizard/types');
const removeKeyboard = require('../helpers/remove-keyboard');
const { TOGGLE_GREETING } = {
    TOGGLE_GREETING: 'toggle_greeting'
};

const stepHandler = getComplexStepHandler([
    PRIVACY,
    AUTH,
    WISHLIST,
    GIVE_LIST,
    FIND_LIST,
    FEEDBACK
]);

stepHandler.action(TOGGLE_GREETING, async ctx => {
    await removeKeyboard(ctx);

    await ctx.session.user.updateOne({
        hideGreeting: !ctx.session.user.hideGreeting
    });

    await ctx.scene.enter(GREETING);
});

const Greeting = new WizardScene(
    GREETING,
    async ctx => {
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

        if (!user?.hideGreeting) {
            await ctx.replyWithMarkdown(
                ctx.session.messages.greeting.general,
                Markup.removeKeyboard()
            );
        }

        if (!user) {
            await ctx.replyWithMarkdown(
                ctx.session.messages.greeting.guest,
                Markup.inlineKeyboard(
                    [
                        Markup.button.callback(
                            ctx.session.messages.auth.title,
                            AUTH
                        ),
                        Markup.button.callback(
                            ctx.session.messages.privacy.title,
                            PRIVACY
                        ),
                        Markup.button.callback(
                            ctx.session.messages.feedback.title,
                            FEEDBACK
                        )
                    ],
                    {
                        columns: 1
                    }
                )
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

        const greetingAction = user.hideGreeting
            ? ctx.session.messages.greeting.actions.show
            : ctx.session.messages.greeting.actions.hide;

        await ctx.replyWithMarkdown(
            user.hideGreeting
                ? ctx.session.messages.greeting.hidden
                : ctx.session.messages.greeting.user,
            Markup.inlineKeyboard(
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
                    Markup.button.callback(greetingAction, TOGGLE_GREETING),
                    Markup.button.callback(
                        ctx.session.messages.privacy.title,
                        PRIVACY
                    ),
                    Markup.button.callback(
                        ctx.session.messages.feedback.title,
                        FEEDBACK
                    )
                ],
                {
                    columns: 1
                }
            )
        );

        return ctx.wizard.next();
    },
    stepHandler
);

module.exports = Greeting;
