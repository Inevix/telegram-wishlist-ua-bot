const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const User = require('../models/user');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { GREETING, PAYMENTS } = require('./types');
const { resetTimer, setTimer } = require('../helpers/timer');
const { REMOVE } = {
    REMOVE: 'remove'
};

const stepHandler = getComplexStepHandler([GREETING]);

stepHandler.on('message', async ctx => {
    try {
        const payments = ctx.update?.message?.text ?? '';

        await resetTimer(ctx);

        if (payments.trim().length < 5) {
            await ctx.sendMessage(
                ctx.session.messages.payments.edit.error,
                Markup.removeKeyboard()
            );

            return await setTimer(ctx, PAYMENTS);
        }

        await ctx.session.user.updateOne({
            payments
        });
        ctx.session.user = await User.findByIdAndUpdate(ctx.session.user._id);

        await ctx.sendMessage(
            ctx.session.messages.payments.edit.success,
            Markup.removeKeyboard()
        );

        return await setTimer(ctx, GREETING);
    } catch (e) {
        return await onUnknownError(ctx, e);
    }
});

stepHandler.action(new RegExp(REMOVE), async ctx => {
    try {
        await ctx.session.user.updateOne({
            payments: ''
        });
        ctx.session.user = await User.findByIdAndUpdate(ctx.session.user._id);

        await ctx.sendMessage(
            ctx.session.messages.payments.remove.success,
            Markup.removeKeyboard()
        );

        return await setTimer(ctx, GREETING);
    } catch (e) {
        return await onUnknownError(ctx, e);
    }
});

const Payments = new WizardScene(
    PAYMENTS,
    async ctx => {
        try {
            const { payments } = ctx.session.user;
            const buttons = [];

            if (payments) {
                buttons.push(
                    Markup.button.callback(
                        ctx.session.messages.actions.remove,
                        REMOVE
                    )
                );
            }

            await resetTimer(ctx);
            await ctx.sendMessage(
                ctx.session.messages.payments.description.add.replace(
                    '%current',
                    payments
                        ? `\n\n${ctx.session.messages.payments.description.update.replace(
                              '%1',
                              payments
                          )}`
                        : ''
                ),
                {
                    ...Markup.inlineKeyboard(
                        [
                            ...buttons,
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
    stepHandler
);

module.exports = Payments;
