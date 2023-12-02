const escaper = require('./escaper');

module.exports = (
    { username = '', first_name = '', last_name = '' },
    value = 'nick'
) => {
    const name =
        first_name || last_name
            ? first_name + `${first_name && last_name ? ' ' : ''}` + last_name
            : `@${username}`;
    const nick = username ? `@${username}` : name;
    const result = value === 'name' ? name : nick;

    return escaper(result);
};
