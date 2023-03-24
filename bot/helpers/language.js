const getMessages = require('../i18n/messages');

module.exports = async (ctx, code, user) => {
    if (user?.language?.code) {
        if (user.language === code || !user?.language?.auto) {
            ctx.session.lang = user.language.code;
        } else {
            if (user?.language?.auto) {
                await user.updateOne({
                    language: {
                        ...user.language,
                        code
                    }
                });

                ctx.session.lang = code;
            }
        }
    } else {
        ctx.session.lang = code;
    }

    ctx.session.messages = getMessages(ctx.session.lang);
};
