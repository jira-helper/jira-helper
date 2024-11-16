// setup-teardown-hook.js
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as matchers from "@testing-library/jest-dom/matchers"
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'
expect.extend(matchers);

// @ts-ignore
global.chrome = {};
afterEach(() => {
  cleanup();
});
beforeAll(() => {
  // @ts-ignore
  global.chrome = {};
});
afterAll(() => {
  // @ts-ignore
  delete global.chrome;
});
