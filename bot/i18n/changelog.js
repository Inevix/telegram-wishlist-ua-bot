const logs = {
    uk: require('../i18n/changelog/ua.json')
};

module.exports = code => (logs[code] ? logs[code] : logs['uk']);
