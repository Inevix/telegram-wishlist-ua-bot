const getDate = require('./date');

module.exports = async (ctx, wish, owner = true) => {
    if (!wish) return '';

    const created = getDate(ctx, wish.createdAt);
    const updated = getDate(ctx, wish.updatedAt);
    const showEditDate = created !== updated;

    const title = `❤️ *${wish.title}*`;
    let priority = '';
    const description = wish.description
        ? `\n\n✏️ Опис:\n${wish.description}`
        : '';
    const editDate = showEditDate ? `\n🗓 _Оновлено: ${updated}_` : '';
    const createdDate = `\n\n🗓 _Створено: ${created}_`;

    if (wish.priority) {
        priority = owner
            ? '\n\n❗️ *Наразі дуже хочу це!*'
            : '\n\n❗️ *Наразі дуже хоче це!*';
    }

    return title + priority + description + createdDate + editDate;
};
