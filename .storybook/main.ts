import type { StorybookViteConfig } from '@storybook/react-vite';

const config: StorybookViteConfig = {
  stories: ['../src/**/*.stories.@(js|ts|tsx|svelte)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-docs'
  ], 
  framework: {
    name: '@storybook/react-vite'
  },
};
export default config;
