const getDate = require('./date');
const { getCutText, textLimitTypes } = require('./cut-text');

module.exports = async (
    ctx,
    wish,
    owner = true,
    onlyTitleAndDate = false,
    showHidden = false
) => {
    try {
        if (!wish) return '';

        const created = getDate(ctx, wish.createdAt);
        const updated = getDate(ctx, wish.updatedAt);
        const showEditDate = created !== updated;
        const editDate = showEditDate
            ? ctx.session.messages.markup.date.updated.replace('%1', updated)
            : '';
        const createdDate = ctx.session.messages.markup.date.created.replace(
            '%1',
            created
        );
        const title = ctx.session.messages.markup.title.replace(
            '%1',
            getCutText(wish.title)
        );
        const hidden =
            wish.hidden && showHidden ? ctx.session.messages.markup.hidden : '';

        if (onlyTitleAndDate) {
            return title + (editDate ? `\n${editDate}` : createdDate) + hidden;
        }

        let priority = '';
        const description = wish.description
            ? ctx.session.messages.markup.description.replace(
                  '%1',
                  getCutText(wish.description, textLimitTypes.DESCRIPTION)
              )
            : '';

        if (wish.priority) {
            priority = owner
                ? ctx.session.messages.markup.priority.owner
                : ctx.session.messages.markup.priority.watcher;
        }

        return title + priority + description + createdDate + editDate + hidden;
    } catch (e) {
        throw e;
    }
};
