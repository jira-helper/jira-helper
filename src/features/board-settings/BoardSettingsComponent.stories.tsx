/* eslint-disable local/no-inline-styles -- Story-only layout for sticky tabs proof. */
import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { globalContainer } from 'dioma';
import {
  extensionApiServiceToken,
  type IExtensionApiService,
} from 'src/infrastructure/extension-api/ExtensionApiService';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { BoardSettingsComponent } from './BoardSettingsComponent';
import { BOARD_SETTINGS_TAB_IDS } from './settingsTabIds';
import { useBoardSettingsStore } from './stores/boardSettings/boardSettings';
import type { BoardSetting } from './stores/boardSettings/types';

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

const LongSettingsContent = ({ title }: { title: string }) => (
  <div style={{ width: 720 }}>
    <h2>{title}</h2>
    <p>
      Scroll this modal body. The settings tabs should remain pinned at the top, so the user can switch sections without
      scrolling back to the beginning.
    </p>
    {Array.from({ length: 24 }, (_, index) => (
      <div
        key={index}
        style={{
          padding: 16,
          marginBottom: 12,
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          background: index % 2 === 0 ? '#fafafa' : '#fff',
        }}
      >
        {title} setting row {index + 1}
      </div>
    ))}
  </div>
);

function createStorySetting(id: string, title: string): BoardSetting {
  const StoryTab = () => <LongSettingsContent title={title} />;
  return { id, title, component: StoryTab };
}

const storySettings: BoardSetting[] = [
  createStorySetting(BOARD_SETTINGS_TAB_IDS.COLUMN_WIP_LIMITS, 'Column WIP Limits'),
  createStorySetting(BOARD_SETTINGS_TAB_IDS.PERSON_WIP_LIMITS, 'Person WIP Limits'),
  createStorySetting(BOARD_SETTINGS_TAB_IDS.SUB_TASKS_PROGRESS, 'Sub-tasks progress'),
  createStorySetting(BOARD_SETTINGS_TAB_IDS.ADDITIONAL_CARD_ELEMENTS, 'Additional Card Elements'),
  createStorySetting(BOARD_SETTINGS_TAB_IDS.COMMENT_TEMPLATES, 'Comment templates'),
  createStorySetting(BOARD_SETTINGS_TAB_IDS.LOCAL_SETTINGS, 'Local Settings'),
  createStorySetting(BOARD_SETTINGS_TAB_IDS.DIAGNOSTIC, 'Diagnostic'),
];

globalContainer.register({ token: localeProviderToken, value: new MockLocaleProvider('en') });
globalContainer.register({ token: extensionApiServiceToken, value: extensionApiStub });

const StoryShell = () => {
  useEffect(() => {
    useBoardSettingsStore.setState({ data: { settings: storySettings } });
  }, []);

  return <BoardSettingsComponent />;
};

const meta: Meta<typeof StoryShell> = {
  title: 'BoardSettings/BoardSettingsComponent',
  component: StoryShell,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof StoryShell>;

export const StickyTabsInScrollableModal: Story = {};
