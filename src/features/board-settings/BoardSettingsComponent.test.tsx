import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { globalContainer } from 'dioma';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  extensionApiServiceToken,
  type IExtensionApiService,
} from 'src/infrastructure/extension-api/ExtensionApiService';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';

import { BoardSettingsComponent } from './BoardSettingsComponent';
import { useBoardSettingsStore } from './stores/boardSettings/boardSettings';
import type { BoardSetting } from './stores/boardSettings/types';

const TestSettingsContent = () => <div>Settings content</div>;

const createSetting = (id: string, title: string): BoardSetting => ({
  id,
  title,
  component: TestSettingsContent,
});

const extensionApiStub: IExtensionApiService = {
  isFirefox: () => false,
  getUrl: resource => resource,
  onMessage: () => undefined,
  onTabsUpdated: () => undefined,
  onTabsActivated: () => undefined,
  checkTabURLByPattern: async () => ({ result: false, url: '' }),
  sendMessageToTab: async () => undefined,
  removeAllContextMenus: () => undefined,
  addContextMenuListener: () => undefined,
  createContextMenu: () => undefined,
  sendMessage: async () => undefined,
};

describe('BoardSettingsComponent', () => {
  beforeEach(() => {
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
    globalContainer.register({
      token: extensionApiServiceToken,
      value: extensionApiStub,
    });
    useBoardSettingsStore.setState({
      data: {
        settings: [createSetting('column-wip-limits', 'Column WIP Limits')],
      },
    });
  });

  it('marks settings tabs so their navigation can stay sticky while modal content scrolls', async () => {
    render(<BoardSettingsComponent />);

    await userEvent.click(screen.getByRole('img'));

    const tabs = document.querySelector('[data-jh-component="boardSettingsTabs"]');

    expect(tabs).toBeInTheDocument();
    expect(tabs).toHaveClass('jh-board-settings-tabs');
  });
});
