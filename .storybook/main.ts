import type { StorybookViteConfig } from '@storybook/react-vite';

const config: StorybookViteConfig = {
  stories: ['../src/**/*.stories.@(js|ts|tsx|svelte)'],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ], 
  framework: {
    name: '@storybook/react-vite'
  },
};
export default config;
