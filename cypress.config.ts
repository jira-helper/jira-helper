import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'cypress';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  /**
   * Multi-reporter:
   *  - `spec`           — обычный live-вывод в консоль (как раньше)
   *  - `cypress-mochawesome-reporter` — HTML/JSON отчёт в `cypress/reports/`
   *    с встроенными скриншотами падений; полезно посмотреть детали без перезапуска.
   */
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, cypress-mochawesome-reporter',
    cypressMochawesomeReporterReporterOptions: {
      reportDir: 'cypress/reports',
      reportFilename: 'index',
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      overwrite: true,
      html: true,
      json: true,
    },
  },
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
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});
