import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { registerExtensionApiServiceInDI } from '../../src/shared/ExtensionApiService';
import { registerRoutingServiceInDI, getSettingsTab } from '../../src/routing';
import { registerRoutingInDI } from '../../src/shared/di/routingTokens';

describe('Routing should', () => {
  beforeEach(() => {
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);
    registerRoutingServiceInDI(globalContainer);
    registerRoutingInDI(globalContainer);
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
