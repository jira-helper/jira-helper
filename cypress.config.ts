import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'cypress';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        optimizeDeps: {
          include: ['react', 'react-dom', 'zustand', 'immer', 'antd'],
        },
        resolve: {
          alias: {
            src: '/src',
            'cypress/support/gherkin-steps/common': path.resolve(__dirname, 'cypress/support/gherkin-steps/common.ts'),
          },
        },
      },
    },
    specPattern: 'src/**/*.cy.tsx',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
});
