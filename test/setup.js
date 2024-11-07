// setup-teardown-hook.js
import { afterAll, beforeAll } from 'vitest';

global.chrome = {};
beforeAll(() => {
  global.chrome = {};
});
afterAll(() => {
  delete global.chrome;
});
