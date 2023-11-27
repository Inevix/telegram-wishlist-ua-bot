const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { GREETING, DONATE } = require('./types');

const stepHandler = getComplexStepHandler([GREETING]);

const Donate = new WizardScene(
    DONATE,
    async ctx => {
        await ctx.sendMessage(
            ctx.session.messages.donate.description,
            Markup.inlineKeyboard(
                [
                    ...ctx.session.messages.donate.services
                        .map(service => {
                            const url = process.env[service.id] ?? '';

                            if (!url) {
                                return '';
                            }

                            return Markup.button.url(service.title, url);
                        })
                        .filter(button => !!button),
                    Markup.button.url(
                        ctx.session.messages.contacts.telegram,
                        process.env.CHANNEL
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
    stepHandler
);

module.exports = Donate;
