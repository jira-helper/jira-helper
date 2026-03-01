import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import storybookPlugin from 'eslint-plugin-storybook';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import requireGherkinStepsImport from './eslint-local-rules/require-gherkin-steps-import.js';

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    ignores: [
      'dist/',
      'dist-firefox/',
      'node_modules/',
      'storybook-static/',
      'cypress-coverage/',
      '*.test.js',
      '**/__tests__/',
    ],
  },
  {
    ignores: ['!.storybook'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  ...storybookPlugin.configs['flat/recommended'],

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        cy: 'readonly',
        Cypress: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-console': 'error',
      quotes: ['error', 'single'],
      'prefer-destructuring': 'warn',
      'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],

      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-useless-assignment': 'warn',

      'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      'consistent-return': 'warn',
      'no-alert': 'error'
    },
  },

  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/*.bdd.test.{ts,tsx}',
      '**/*.steps.ts',
      '**/*.cy.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },

  {
    files: ['**/*.feature.cy.tsx'],
    plugins: {
      local: {
        rules: {
          'require-gherkin-steps-import': requireGherkinStepsImport,
        },
      },
    },
    rules: {
      'local/require-gherkin-steps-import': 'error',
    },
  },
];
