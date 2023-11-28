const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const User = require('../models/user');
const removeKeyboard = require('../helpers/remove-keyboard');
const { setTimer } = require('../helpers/timer');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { GREETING, AUTH } = require('./types');
const { ONLY_USERNAME, ONLY_PHONE_NUMBER, USERNAME_AND_PHONE_NUMBER } = {
    ONLY_USERNAME: 'username',
    ONLY_PHONE_NUMBER: 'phone',
    USERNAME_AND_PHONE_NUMBER: 'both'
};

const Auth = new WizardScene(
    AUTH,
    async ctx => {
        try {
            await ctx.replyWithMarkdown(
                ctx.session.messages.auth.description,
                Markup.inlineKeyboard(
                    [
                        Markup.button.callback(
                            ctx.session.messages.auth.types.username,
                            ONLY_USERNAME
                        ),
                        Markup.button.callback(
                            ctx.session.messages.auth.types.phone,
                            ONLY_PHONE_NUMBER
                        ),
                        Markup.button.callback(
                            ctx.session.messages.auth.types.both,
                            USERNAME_AND_PHONE_NUMBER
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
        try {
            const callback = ctx.update?.callback_query;

            if (!callback) {
                return await ctx.scene.enter(AUTH);
            }

            const {
                data,
                from: { username }
            } = callback;

            if (data === GREETING) {
                await removeKeyboard(ctx);

                return await ctx.scene.enter(GREETING);
            }

            if (
                !username &&
                (data === ONLY_USERNAME || data === USERNAME_AND_PHONE_NUMBER)
            ) {
                await ctx.sendMessage(
                    ctx.session.messages.auth.errors.username
                );

                return await setTimer(ctx, GREETING);
            }

            let user;

            if (username && data === ONLY_USERNAME) {
                user = await new User({
                    telegramId: ctx.session.telegramId,
                    username
                });

                await user.save();
                await ctx.sendMessage(
                    ctx.session.messages.auth.success.username.replace(
                        '%1',
                        username
                    ),
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, GREETING);
            }

            ctx.scene.session.username = username;
            ctx.scene.session.authType = data;

            await ctx.replyWithMarkdown(
                ctx.session.messages.auth.sendNumber.description,
                Markup.keyboard([
                    Markup.button.contactRequest(
                        ctx.session.messages.auth.sendNumber.title
                    )
                ])
                    .oneTime()
                    .resize()
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    async ctx => {
        const phone = ctx.update?.message?.contact?.phone_number;
        let user;

        if (!phone) {
            try {
                await ctx.replyWithMarkdown(
                    ctx.session.messages.auth.errors.phone,
                    Markup.removeKeyboard()
                );

                return await setTimer(ctx, AUTH);
            } catch (e) {
                return await onUnknownError(ctx, e);
            }
        }

        const userData = {
            telegramId: ctx.session.telegramId,
            phone
        };
        const { username } = ctx.scene.session;

        if (ctx.scene.session.authType === USERNAME_AND_PHONE_NUMBER) {
            userData['username'] = username;
        }

        try {
            user = await new User(userData);

            await user.save();
        } catch (e) {
            await ctx.sendMessage(
                ctx.session.messages.errors.unknown,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, GREETING);
        }

        try {
            if (ctx.scene.session.authType === ONLY_PHONE_NUMBER) {
                await ctx.sendMessage(
                    ctx.session.messages.auth.success.phone.replace('%1', phone)
                );
            } else {
                await ctx.sendMessage(
                    ctx.session.messages.auth.success.both
                        .replace('%1', username)
                        .replace('%2', phone)
                );
            }

            return await setTimer(ctx, GREETING);
        } catch (e) {
            return onUnknownError(ctx, e);
        }
    }
);

module.exports = Auth;
