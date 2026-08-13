import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { globalContainer } from 'dioma';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
    const tabsNavigation = document.querySelector('[data-jh-component="boardSettingsTabs"] .ant-tabs-nav');

    expect(tabs).toBeInTheDocument();
    expect(tabs).toHaveClass('jh-board-settings-tabs');
    expect(tabsNavigation).toHaveStyle({ position: 'sticky', top: '0px' });
  });

  describe('Jira 11 board stacking (#32)', () => {
    let host: HTMLElement;
    let boardLayer: HTMLElement;

    beforeEach(() => {
      host = document.createElement('div');
      host.setAttribute('data-testid', 'jira-sidebar-host');
      host.style.position = 'relative';
      host.style.zIndex = '1';
      document.body.appendChild(host);

      boardLayer = document.createElement('div');
      boardLayer.setAttribute('data-testid', 'jira-board-layer');
      boardLayer.style.position = 'relative';
      boardLayer.style.zIndex = '20';
      document.body.appendChild(boardLayer);
    });

    afterEach(() => {
      host.remove();
      boardLayer.remove();
    });

    it('portals the settings modal to document.body so Rapid Board layers cannot paint over it', async () => {
      render(<BoardSettingsComponent />, { container: host });

      await userEvent.click(screen.getByRole('img'));

      const modalRoot = document.querySelector('.jh-board-settings-modal');
      expect(modalRoot).toBeTruthy();
      expect(host.contains(modalRoot)).toBe(false);
      expect(document.body.contains(modalRoot)).toBe(true);
      expect(Number.parseInt(getComputedStyle(modalRoot as HTMLElement).zIndex, 10)).toBeGreaterThan(
        Number.parseInt(boardLayer.style.zIndex, 10)
      );
    });
  });
});
