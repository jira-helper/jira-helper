import { describe, it, expect, vi } from 'vitest';
import runModifications from '../../src/shared/runModifications';

describe('RunModifications should', () => {
  it('applyModifications', () => {
    /**
     * Нужно замокировать объект window
     * @see ../../src/shared/ExtensionApiService.js:3
     */
    vi.stubGlobal('window', {});

    expect(() => runModifications({ ALL: '' })).toThrowError();
  });
});
