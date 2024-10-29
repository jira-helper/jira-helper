/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';

// import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// import arraybuffer from 'vite-plugin-arraybuffer';

import manifest from './manifest.json';

export default defineConfig({
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [
    // @ts-expect-error
    crx({ manifest }),

    //     svelte({
    //       compilerOptions: {
    //         customElement: true,
    //       },
    //       preprocess: vitePreprocess(),
    //     }),
    //     arraybuffer(),
  ],
  test: {
    environment: 'happy-dom',
  },
});
