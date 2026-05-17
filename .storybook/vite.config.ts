import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../src'),
      cypress: path.resolve(__dirname, '../cypress')
    }
  }
});
