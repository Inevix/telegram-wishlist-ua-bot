module.exports = name => {
    try {
        const restrictSymbols = [
            {
                symbol: '<3',
                replace: '❤️'
            }
        ];
        let result = name;

        for (const { symbol, replace } of restrictSymbols) {
            result = result.replace(symbol, replace);
        }

        return result;
    } catch (e) {
        throw e;
    }
};
