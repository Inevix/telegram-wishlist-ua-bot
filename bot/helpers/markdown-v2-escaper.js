module.exports = {
    escapeMarkdownV2(
        message,
        exclude = [],
        chars = [
            '_',
            '*',
            '[',
            ']',
            '(',
            ')',
            '~',
            '`',
            '>',
            '#',
            '+',
            '-',
            '=',
            '|',
            '{',
            '}',
            '.',
            '!'
        ]
    ) {
        const specialCharacters = chars.filter(char => !exclude.includes(char));
        let escapedMessage = message;

        specialCharacters.forEach(character => {
            let regex = new RegExp('\\' + character, 'g');
            escapedMessage = escapedMessage.replace(regex, '\\' + character);
        });

        return escapedMessage;
    }
};
