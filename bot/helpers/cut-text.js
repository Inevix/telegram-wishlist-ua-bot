const { TITLE, DESCRIPTION } = {
    TITLE: 'title',
    DESCRIPTION: 'description'
};

const LIMITS = {
    [TITLE]: 100,
    [DESCRIPTION]: 300
};

const getCutText = (str, type = TITLE) => {
    try {
        switch (type) {
            case DESCRIPTION:
                return str.length > LIMITS[DESCRIPTION]
                    ? str.substring(0, LIMITS[DESCRIPTION])
                    : str;
            default:
                return str.length > LIMITS[TITLE]
                    ? str.substring(0, LIMITS[TITLE])
                    : str;
        }
    } catch (e) {
        throw e;
    }
};

module.exports = {
    getCutText,
    textLimitTypes: { TITLE, DESCRIPTION },
    textLimits: LIMITS
};
