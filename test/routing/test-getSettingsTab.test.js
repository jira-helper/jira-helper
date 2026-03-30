import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { routingServiceToken } from '../../src/routing';
import { settingsPagePageObjectToken } from '../../src/page-objects/SettingsPage';
import { registerExtensionApiServiceInDI } from '../../src/shared/ExtensionApiService';
import { PageModification } from '../../src/shared/PageModification';

class TestModification extends PageModification {
  async getTab() {
    return this.getSettingsTab();
  }
}

describe('PageModification.getSettingsTab', () => {
  let modification;

  const cases = [
    ['?tab=settings-tab', 'settings-tab'],
    ['?config=config-tab', 'config-tab'],
  ];

  it.each(cases)('when "%s" is given then return "%s"', async (search, tab) => {
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);

    globalContainer.register({
      token: routingServiceToken,
      value: {
        getSearchParam: vi.fn().mockImplementation(param => new URLSearchParams(search).get(param)),
      },
    });
    globalContainer.register({
      token: settingsPagePageObjectToken,
      value: {
        selectors: { settingsContent: '#main', selectedNav: '.aui-nav-selected' },
        getSelectedTab: vi.fn().mockReturnValue(null),
      },
    });

    modification = new TestModification();
    expect.assertions(1);
    await expect(modification.getTab()).resolves.toEqual(tab);
  });
});
