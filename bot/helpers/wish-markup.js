const getDate = require('./date');
const { getCutText, textLimitTypes } = require('./cut-text');
const { escapeMarkdownV2 } = require('./markdown-v2-escaper');

module.exports = async (
    ctx,
    wish,
    owner = true,
    onlyTitleAndDate = false,
    showHidden = false
) => {
    try {
        if (!wish) return '';

        const created = escapeMarkdownV2(getDate(ctx, wish.createdAt), ['_']);
        const updated = escapeMarkdownV2(getDate(ctx, wish.updatedAt), ['_']);
        const showEditDate = created !== updated;
        const editDate = showEditDate
            ? ctx.session.messages.markup.date.updated.replace('%1', updated)
            : '';
        const createdDate = ctx.session.messages.markup.date.created.replace(
            '%1',
            created
        );
        const title = escapeMarkdownV2(
            ctx.session.messages.markup.title.replace(
                '%1',
                getCutText(wish.title)
            ),
            ['*', '_', '[', ']', '(', ')']
        );
        const hidden =
            wish.hidden && showHidden
                ? escapeMarkdownV2(ctx.session.messages.markup.hidden, ['_'])
                : '';

        if (onlyTitleAndDate) {
            return title + (editDate ? `\n${editDate}` : createdDate) + hidden;
        }

        let priority = '';
        const description = wish.description
            ? escapeMarkdownV2(
                  ctx.session.messages.markup.description.replace(
                      '%1',
                      getCutText(wish.description, textLimitTypes.DESCRIPTION)
                  )
              )
            : '';

        if (wish.priority) {
            priority = escapeMarkdownV2(
                owner
                    ? ctx.session.messages.markup.priority.owner
                    : ctx.session.messages.markup.priority.watcher,
                ['*', '>']
            );
        }

        return title + priority + description + createdDate + editDate + hidden;
    } catch (e) {
        throw e;
    }
};
