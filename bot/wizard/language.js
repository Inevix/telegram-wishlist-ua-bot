const {
    Scenes: { WizardScene },
    Markup
} = require('telegraf');
const getComplexStepHandler = require('../helpers/complex-step-handler');
const { setTimer } = require('../helpers/timer');
const { GREETING, LANGUAGE } = require('./types');
const { SET_UA, SET_EN, SET_PL, SET_AUTO } = {
    SET_UA: 'set_ua',
    SET_EN: 'set_en',
    SET_PL: 'set_pl',
    SET_AUTO: 'set_auto'
};

const stepHandler = getComplexStepHandler([GREETING]);

const setLanguage = async (ctx, lang = 'uk') => {
    if (ctx.session.lang === lang) {
        await ctx.sendMessage(
            ctx.session.messages.setLanguage.error,
            Markup.removeKeyboard()
        );

        return await setTimer(ctx, GREETING);
    }

    ctx.session.lang = lang;

    await ctx.session.user.updateOne({
        language: {
            code: ctx.session.lang,
            auto: false
        }
    });

    await ctx.sendMessage(
        ctx.session.messages.setLanguage.success.language,
        Markup.removeKeyboard()
    );

    return await setTimer(ctx, GREETING);
};

stepHandler.action(SET_UA, async ctx => await setLanguage(ctx));

stepHandler.action(SET_EN, async ctx => await setLanguage(ctx, 'en'));

stepHandler.action(SET_AUTO, async ctx => {
    if (ctx.session.user.language.auto) {
        await ctx.sendMessage(
            ctx.session.messages.setLanguage.error,
            Markup.removeKeyboard()
        );

        return await setTimer(ctx, GREETING);
    }

    await ctx.session.user.updateOne({
        language: {
            ...ctx.session.user.language,
            auto: true
        }
    });

    await ctx.sendMessage(
        ctx.session.messages.setLanguage.success.auto,
        Markup.removeKeyboard()
    );

    return await setTimer(ctx, GREETING);
});

const Language = new WizardScene(
    LANGUAGE,
    async ctx => {
        await ctx.sendMessage(
            ctx.session.messages.language.description,
            Markup.inlineKeyboard(
                [
                    Markup.button.callback(
                        ctx.session.messages.language.options.ua,
                        SET_UA
                    ),
                    Markup.button.callback(
                        ctx.session.messages.language.options.en,
                        SET_EN
                    ),
                    Markup.button.callback(
                        ctx.session.messages.language.options.pl,
                        SET_PL
                    ),
                    Markup.button.callback(
                        ctx.session.messages.language.options.auto,
                        SET_AUTO
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

module.exports = Language;
