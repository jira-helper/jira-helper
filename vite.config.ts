/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { readFileSync } from 'fs';

import * as path from 'path';
import manifest from './manifest.json';

// Verify version consistency
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
const packageVersion = packageJson.version;
const manifestVersion = manifest.version;

if (packageVersion !== manifestVersion) {
  throw new Error(
    `Version mismatch: package.json version is "${packageVersion}" but manifest.json version is "${manifestVersion}". ` +
      'Please update both files to have the same version.'
  );
}

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
