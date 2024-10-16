import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSettingsTab } from '../../src/routing';

describe('Routing should', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { search: '' });
  });

  const cases = [
    ['tab=settings-tab', 'settings-tab'],
    ['config=config-tab', 'config-tab'],
  ];

  it.each(cases)('when "%s" is given then return "%s"', async (search, tab) => {
    window.location.search = search;
    expect.assertions(1);
    await expect(getSettingsTab()).resolves.toEqual(tab);
  });
});
