import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import storybookPlugin from 'eslint-plugin-storybook';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import requireGherkinStepsImport from './eslint-local-rules/require-gherkin-steps-import.js';
import noChainedStubAs from './eslint-local-rules/no-chained-stub-as.js';
import noDirectValtioSnapshot from './eslint-local-rules/no-direct-valtio-snapshot.js';
import moduleImportBoundary from './eslint-local-rules/module-import-boundary.js';
import requireStorybookTitleHierarchy from './eslint-local-rules/require-storybook-title-hierarchy.js';
import noInlineStyles from './eslint-local-rules/no-inline-styles.js';

const localPlugin = {
  rules: {
    'no-direct-valtio-snapshot': noDirectValtioSnapshot,
    'module-import-boundary': moduleImportBoundary,
    'require-gherkin-steps-import': requireGherkinStepsImport,
    'require-storybook-title-hierarchy': requireStorybookTitleHierarchy,
    'no-inline-styles': noInlineStyles,
  },
};

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
      local: localPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-console': 'error',
      quotes: ['error', 'single'],
      "prefer-destructuring": [
        "error", {
          VariableDeclarator: { array: false, object: true },
          AssignmentExpression: { array: false, object: false },
        },
      ],
      'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],

      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      'no-useless-assignment': 'warn',

      'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
      'react/no-unstable-nested-components': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',

      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      'consistent-return': 'off',
      'no-alert': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',

      'local/no-direct-valtio-snapshot': 'error',
      'local/no-inline-styles': 'error',
    },
  },

  {
    files: ['**/src/features/*/module.ts'],
    rules: {
      'local/module-import-boundary': 'error',
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
    files: ['**/*.cy.{ts,tsx}'],
    plugins: {
      'local-cypress': {
        rules: {
          'no-chained-stub-as': noChainedStubAs,
        },
      },
    },
    rules: {
      'local-cypress/no-chained-stub-as': 'error',
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'local/require-storybook-title-hierarchy': 'error',
    },
  },

  {
    files: ['**/*.feature.cy.tsx'],
    rules: {
      'local/require-gherkin-steps-import': 'error',
    },
  },
];
