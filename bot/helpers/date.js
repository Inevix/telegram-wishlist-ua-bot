module.exports = (ctx, date) => {
    const { lang } = ctx.session;

    return new Intl.DateTimeFormat(`${lang}-UA`, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};
