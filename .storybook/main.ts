import type { StorybookViteConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookViteConfig = {
  stories: ['../src/**/*.stories.@(js|ts|tsx|svelte)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: '.storybook/vite.config.ts'
      }
    }
  },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      server: {
        watch: {
          ignored: ['**/.playwright/**', '**/.logs/**']
        }
      }
    });
  }
};
export default config;
