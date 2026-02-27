import { defineConfig } from 'cypress';

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
          },
        },
      },
    },
    specPattern: 'src/**/*.cy.tsx',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
});
