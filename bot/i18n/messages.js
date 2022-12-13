const languages = {
    uk: require('../i18n/uk.json'),
    en: require('../i18n/en.json')
};

module.exports = code => (languages[code] ? languages[code] : languages['uk']);
