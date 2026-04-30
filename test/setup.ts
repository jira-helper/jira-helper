// setup-teardown-hook.js
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

expect.extend(matchers);

// @ts-expect-error -- chrome stub for extension tests (not in DOM lib)
global.chrome = {};
afterEach(() => {
  cleanup();
});
beforeAll(() => {
  // @ts-expect-error -- chrome stub for extension tests (not in DOM lib)
  global.chrome = {};
});
afterAll(() => {
  // @ts-expect-error -- chrome stub for extension tests (not in DOM lib)
  delete global.chrome;
});
