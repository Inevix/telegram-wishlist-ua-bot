const multi = require('../i18n/multi.json');

const languages = {
    uk: require('../i18n/ua.json'),
    en: require('../i18n/en.json'),
    pl: require('../i18n/pl.json')
};

const getMessages = code => {
    const messages = languages[code] ? languages[code] : languages['uk'];

    return {
        ...messages,
        ...multi
    };
};

module.exports = code => getMessages(code);
