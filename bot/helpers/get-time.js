const options = {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
};

module.exports = {
    getTime() {
        return new Intl.DateTimeFormat('en-US', options).format(new Date());
    }
};
