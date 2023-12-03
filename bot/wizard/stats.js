const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const User = require('../models/user');
const Wish = require('../models/wish');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { GREETING, STATS } = require('./types');

const stepHandler = getComplexStepHandler([GREETING]);

const Stats = new WizardScene(
    STATS,
    async ctx => {
        try {
            const users = await User.find().count();
            const wishes = await Wish.find().count();
            const doneWishes = await Wish.find({ done: true }).count();

            await ctx.sendMessage(
                `${
                    ctx.session.messages.stats.title
                }\n\n${ctx.session.messages.stats.users.replace(
                    '%1',
                    users
                )}\n${ctx.session.messages.stats.wishes.replace(
                    '%1',
                    wishes
                )}\n${ctx.session.messages.stats.done.replace(
                    '%1',
                    doneWishes
                )}`,
                {
                    ...Markup.inlineKeyboard(
                        [
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

module.exports = Stats;
