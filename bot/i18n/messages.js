const languages = {
    uk: require('../i18n/messages/uk.json'),
    en: require('../i18n/messages/en.json')
};

module.exports = code => (languages[code] ? languages[code] : languages['uk']);
