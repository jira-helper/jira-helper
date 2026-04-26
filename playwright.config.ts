import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  testMatch: 'storybook.visual.spec.ts',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:6006',
    viewport: {
      width: 800,
      height: 600,
    },
  },
  webServer: {
    command:
      'npm run build-storybook && npx vite preview --outDir storybook-static --host 127.0.0.1 --port 6006 --strictPort',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
