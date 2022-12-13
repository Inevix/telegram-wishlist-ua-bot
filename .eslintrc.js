// eslint-disable-next-line no-undef
module.exports = {
    env: {
        node: true,
        es6: true
    },
    parserOptions: {
        ecmaVersion: 2022
    },
    plugins: ['json', 'prettier'],
    extends: ['plugin:json/recommended', 'plugin:prettier/recommended'],
    rules: {
        'no-var': 'error'
    }
};
