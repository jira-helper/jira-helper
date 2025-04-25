/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';

import * as path from 'path';
import manifest from './manifest.json';

const targetBrowser = process.env.BROWSER === 'FIREFOX' ? 'firefox' : 'chrome';

if (targetBrowser === 'firefox') {
  manifest.name = 'jira-helper-for-ff';
}
export default defineConfig({
  build: {
    outDir: targetBrowser === 'chrome' ? 'dist' : 'dist-firefox',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: false,
  },
  plugins: [
    // @ts-expect-error
    crx({ manifest, browser: targetBrowser }),
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx'],
      reporter: ['lcov'],
    },
  },

  resolve: {
    alias: {
      src: path.resolve(__dirname, '/src'),
    },
  },
});
