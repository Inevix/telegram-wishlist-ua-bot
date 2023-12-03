const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { onUnknownError } = require('../helpers/on-unknown-error');
const { GREETING, PRIVACY, FEEDBACK } = require('./types');

const stepHandler = getComplexStepHandler([GREETING, FEEDBACK]);

const Privacy = new WizardScene(
    PRIVACY,
    async ctx => {
        try {
            const {
                GITHUB_REPO_URL,
                PRINCESS_BOT_URL,
                YOUTUBE,
                CHANNEL,
                PORTFOLIO
            } = process.env;
            const buttons = [];

            if (GITHUB_REPO_URL) {
                buttons.push(
                    Markup.button.url(
                        ctx.session.messages.privacy.links.github,
                        GITHUB_REPO_URL
                    )
                );
            }

            if (PRINCESS_BOT_URL) {
                buttons.push(
                    Markup.button.url(
                        ctx.session.messages.privacy.links.princess,
                        PRINCESS_BOT_URL
                    )
                );
            }

            if (YOUTUBE) {
                buttons.push(
                    Markup.button.url(
                        ctx.session.messages.privacy.links.youtube,
                        YOUTUBE
                    )
                );
            }

            if (CHANNEL) {
                buttons.push(
                    Markup.button.url(
                        ctx.session.messages.privacy.links.telegram,
                        CHANNEL
                    )
                );
            }

            if (PORTFOLIO) {
                buttons.push(
                    Markup.button.url(
                        ctx.session.messages.privacy.links.portfolio,
                        PORTFOLIO
                    )
                );
            }

            buttons.push(
                Markup.button.callback(
                    ctx.session.messages.feedback.title,
                    FEEDBACK
                ),
                Markup.button.callback(
                    ctx.session.messages.actions.home,
                    GREETING
                )
            );

            await ctx.replyWithMarkdown(
                ctx.session.messages.privacy.description.sensitive +
                    ctx.session.messages.privacy.description.openSource +
                    ctx.session.messages.privacy.description.languages +
                    ctx.session.messages.privacy.description.feedback +
                    ctx.session.messages.feedback.description.points +
                    ctx.session.messages.privacy.description.otherProjects
                        .title +
                    '\n\n - ' +
                    ctx.session.messages.privacy.description.otherProjects.projects.join(
                        '\n - '
                    ),
                Markup.inlineKeyboard(buttons, {
                    columns: 1
                })
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    },
    stepHandler
);

module.exports = Privacy;
