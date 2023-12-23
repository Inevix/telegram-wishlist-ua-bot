module.exports = {
    getTime() {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Kyiv',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date());
    },

    getCurrency(ctx, value) {
        return new Intl.NumberFormat(ctx.session.lang, {
            style: 'currency',
            currency: ctx.session.user.currency
        }).format(value);
    },

    getDate(ctx, date) {
        return new Intl.DateTimeFormat(ctx.session.lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }
};
