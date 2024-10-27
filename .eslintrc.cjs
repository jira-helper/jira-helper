module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier', '@typescript-eslint/eslint-plugin'],
  env: {
    browser: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': 'typescript',
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
    'import/extensions': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-undef': 'off',
    'max-classes-per-file': 'off',
    'no-continue': 'off',
  },
};
