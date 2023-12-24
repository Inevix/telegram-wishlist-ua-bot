const { Markup } = require('telegraf');
const { getCurrency } = require('./intl');
const { onUnknownError } = require('./on-unknown-error');

const { FILTER, FILTER_RESET } = {
    FILTER: 'filter',
    FILTER_RESET: 'filter_reset'
};

const filters = [
    {
        from: 0,
        to: 999
    },
    {
        from: 1000,
        to: 1999
    },
    {
        from: 2000,
        to: 4999
    },
    {
        from: 5000,
        to: 9999
    },
    {
        from: 10000
    }
];

const getFilters = () => filters;

const getPriceFilter = (ctx, filter) => {
    if (filter >= 0) {
        const { from, to } = getFilters()[filter];

        return {
            price: {
                $gte: from,
                $lte: to
            }
        };
    }

    return {};
};

const getPriceFilterTitle = (ctx, index) => {
    const { from, to } = getFilters()[index];

    if (from && to) {
        return ctx.session.messages.filters.fromTo
            .replace('%1', getCurrency(ctx, from))
            .replace('%2', getCurrency(ctx, to));
    } else if (from) {
        return ctx.session.messages.filters.from.replace(
            '%1',
            getCurrency(ctx, from)
        );
    } else {
        return ctx.session.messages.filters.to.replace(
            '%1',
            getCurrency(ctx, to)
        );
    }
};

const getStepFilterHandler = stepHandler => {
    return stepHandler.action(FILTER, async ctx => {
        try {
            const filters = getFilters();
            const buttons = [];

            for (const [index, filter] of filters.entries()) {
                buttons.push(
                    Markup.button.callback(
                        getPriceFilterTitle(ctx, index),
                        `${FILTER}_${index}`
                    )
                );
            }

            await ctx.sendMessage(
                ctx.session.messages.filters.description,
                Markup.inlineKeyboard(
                    [
                        ...buttons,
                        Markup.button.callback(
                            ctx.session.messages.filters.reset,
                            FILTER_RESET
                        )
                    ],
                    {
                        columns: 1
                    }
                )
            );

            return ctx.wizard.next();
        } catch (e) {
            return await onUnknownError(ctx, e);
        }
    });
};

module.exports = {
    getFilters,
    getPriceFilter,
    getPriceFilterTitle,
    getStepFilterHandler
};
