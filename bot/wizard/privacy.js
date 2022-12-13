const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const removeKeyboard = require('../helpers/remove-keyboard');
const { GREETING, PRIVACY, FEEDBACK } = require('./types');

const stepHandler = getComplexStepHandler([GREETING, FEEDBACK]);

const Privacy = new WizardScene(
    PRIVACY,
    async ctx => {
        const { GITHUB_REPO_URL, PRINCESS_BOT_URL } = process.env;
        const buttons = [];

        if (GITHUB_REPO_URL) {
            buttons.push(
                Markup.button.url(
                    ctx.session.messages.privacy.links.github,
                    GITHUB_REPO_URL
                )
            );
        }

        buttons.push(
            Markup.button.callback(
                ctx.session.messages.feedback.title,
                FEEDBACK
            ),
            Markup.button.callback(ctx.session.messages.actions.home, GREETING)
        );

        if (PRINCESS_BOT_URL) {
            buttons.push(
                Markup.button.url(
                    ctx.session.messages.privacy.links.princess,
                    PRINCESS_BOT_URL
                )
            );
        }

        // Todo: complete description
        await ctx.replyWithMarkdown(
            ctx.session.messages.privacy.description.sensitive +
                ctx.session.messages.privacy.description.openSource +
                ctx.session.messages.privacy.description.languages +
                ctx.session.messages.privacy.description.feedback +
                ctx.session.messages.feedback.description.points +
                ctx.session.messages.privacy.description.otherProjects,
            Markup.inlineKeyboard(buttons, {
                columns: 1
            })
        );

        return ctx.wizard.next();
    },
    stepHandler
);

module.exports = Privacy;
