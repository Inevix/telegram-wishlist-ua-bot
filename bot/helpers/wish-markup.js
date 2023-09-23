const getDate = require('./date');
const { getCutText, textLimitTypes } = require('./cut-text');

module.exports = async (ctx, wish, owner = true, onlyTitleAndDate = false) => {
    if (!wish) return '';

    const created = getDate(ctx, wish.createdAt);
    const updated = getDate(ctx, wish.updatedAt);
    const showEditDate = created !== updated;
    const editDate = showEditDate ? `\n🗓 _Оновлено: ${updated}_` : '';
    const createdDate = `\n\n🗓 _Створено: ${created}_`;
    const title = `❤️ *${getCutText(wish.title)}*`;

    if (onlyTitleAndDate) {
        return title + (editDate ? `\n${editDate}` : createdDate);
    }

    let priority = '';
    const description = wish.description
        ? `\n\n✏️ Опис:\n${getCutText(
              wish.description,
              textLimitTypes.DESCRIPTION
          )}`
        : '';

    if (wish.priority) {
        priority = owner
            ? '\n\n❗️ *Наразі дуже хочу це!*'
            : '\n\n❗️ *Наразі дуже хоче це!*';
    }

    return title + priority + description + createdDate + editDate;
};
