module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    jest: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true,
    },
    requireConfigFile: false,
  },
  rules: {
    'no-console': 'error',
    'comma-dangle': 'off',
    'import/no-extraneous-dependencies': 'error',
    'consistent-return': 'warn',
    'import/prefer-default-export': 'off',
    quotes: ['error', 'single'],
    'import/no-unresolved': [2, { caseSensitive: false }],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'arrow-body-style': 'off',
    'no-promise-executor-return': 'off',
  },
};
