/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
// import arraybuffer from 'vite-plugin-arraybuffer';

import manifest from './manifest.json';

// @ts-expect-error
const targetBrowser = process.env.BROWSER === 'FIREFOX' ? 'firefox' : 'chrome';

export default defineConfig({
  build: {
    outDir: targetBrowser === 'chrome' ? 'dist' : 'dist-firefox',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [
    // @ts-expect-error
    crx({ manifest, browser: targetBrowser }),
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.js'],
  }
});
