const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const User = require('../models/user');
const removeKeyboard = require('../helpers/remove-keyboard');
const { setTimer } = require('../helpers/timer');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { GREETING, AUTH } = require('./types');
const getChanges = require('../i18n/changelog');
const { ONLY_USERNAME, ONLY_PHONE_NUMBER, USERNAME_AND_PHONE_NUMBER } = {
    ONLY_USERNAME: 'username',
    ONLY_PHONE_NUMBER: 'phone',
    USERNAME_AND_PHONE_NUMBER: 'both'
};

const Auth = new WizardScene(
    AUTH,
    async ctx => {
        try {
            const { user } = ctx.session;
            let userVisibilityType;

            if (user?.username && user?.phone) {
                userVisibilityType = USERNAME_AND_PHONE_NUMBER;
            } else if (user?.username && !user?.phone) {
                userVisibilityType = ONLY_USERNAME;
            } else if (!user?.username && user?.phone) {
                userVisibilityType = ONLY_PHONE_NUMBER;
            }

            const generalQuestion =
                ctx.session.messages.auth.description.general;
            const noteAboutUsername =
                ctx.session.messages.auth.description.username
                    .replace(
                        `%${ONLY_USERNAME}`,
                        ctx.session.messages.auth.types[ONLY_USERNAME]
                    )
                    .replace(
                        `%${USERNAME_AND_PHONE_NUMBER}`,
                        ctx.session.messages.auth.types[
                            USERNAME_AND_PHONE_NUMBER
                        ]
                    );

            await ctx.sendMessage(
                ctx.session.user
                    ? ctx.session.messages.auth.description.user.replace(
                          '%1',
                          ctx.session.messages.auth.types[userVisibilityType]
                      ) +
                          noteAboutUsername +
                          '\n\n' +
                          generalQuestion
                    : generalQuestion +
                          ctx.session.messages.auth.description.guest +
                          noteAboutUsername,
                {
                    ...Markup.inlineKeyboard(
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
                    ),
                    parse_mode: 'Markdown'
                }
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

            if (username && data === ONLY_USERNAME) {
                try {
                    if (ctx.session.user) {
                        await User.findByIdAndUpdate(ctx.session.user._id, {
                            username
                        });
                    } else {
                        const changelog = getChanges();
                        const latest = Object.keys(changelog)[0];

                        const user = await new User({
                            telegramId: ctx.session.telegramId,
                            username,
                            version: latest,
                            noticed: true
                        });

                        await user.save();
                    }
                } catch (e) {
                    await onUnknownError(ctx, e);

                    return await setTimer(ctx, AUTH);
                }

                const successMessage = ctx.session.user
                    ? ctx.session.messages.auth.success.user
                    : ctx.session.messages.auth.success.guest;

                await ctx.sendMessage(
                    successMessage +
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
            await onUnknownError(ctx, e);

            return await setTimer(ctx, AUTH);
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
            if (ctx.session.user) {
                await User.findByIdAndUpdate(ctx.session.user._id, userData);
            } else {
                user = await new User(userData);

                await user.save();
            }
        } catch (e) {
            await ctx.sendMessage(
                ctx.session.messages.errors.unknown,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, GREETING);
        }

        const successMessage = ctx.session.user
            ? ctx.session.messages.auth.success.user
            : ctx.session.messages.auth.success.guest;

        try {
            if (ctx.scene.session.authType === ONLY_PHONE_NUMBER) {
                await ctx.sendMessage(
                    successMessage +
                        ctx.session.messages.auth.success.phone.replace(
                            '%1',
                            phone
                        )
                );
            } else {
                await ctx.sendMessage(
                    successMessage +
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
