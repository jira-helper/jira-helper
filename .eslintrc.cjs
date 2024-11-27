module.exports = {
  extends: ['airbnb', 'prettier', 'plugin:storybook/recommended'],
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
    'consistent-return': 'warn',
    'import/prefer-default-export': 'off',
    quotes: ['error', 'single'],
    'import/no-unresolved': [2, { caseSensitive: false }],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
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
    'import/no-extraneous-dependencies': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'react/function-component-definition': 'off',
    'react/destructuring-assignment': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/alt-text': 'off',
    'no-useless-constructor': 'off',
    'no-empty-function': 'off',
    'guard-for-in': 'off',
  },
};
