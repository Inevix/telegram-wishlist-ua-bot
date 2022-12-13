module.exports = group => {
    const result = [];

    for (const image of group) {
        if (!image) continue;

        result.push({
            media: image,
            type: 'photo'
        });
    }

    return result;
};
