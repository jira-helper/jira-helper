import React from 'react';

import { Button, Checkbox } from 'antd';

import { resetBoardProperty } from 'src/features/sub-tasks-progress/BoardSettings/actions/resetBoardProperty';

import { ColumnsSettingsContainer } from 'src/features/sub-tasks-progress/BoardSettings/ColumnSettings/ColumnSettings';
import { CountSettings } from 'src/features/sub-tasks-progress/BoardSettings/CountSettings/CountSettings';
import { GroupingSettings } from 'src/features/sub-tasks-progress/BoardSettings/GroupingSettings/GroupingSettings';
import { UserGuide } from 'src/features/sub-tasks-progress/BoardSettings/UserGuide';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetSettings } from '../SubTaskProgressSettings/hooks/useGetSettings';
import { toggleEnabled } from './actions/toggleEnabled';

const TEXTS = {
  title: {
    en: 'Sub-tasks progress',
    ru: 'Прогресс подзадач',
  },
  resetButton: {
    en: 'Reset all settings',
    ru: 'Сброс всех настроек',
  },
  enableFeature: {
    en: 'Enable sub-tasks progress',
    ru: 'Включить прогресс подзадач',
  },
};

export const BoardSettingsTabContent = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { settings } = useGetSettings();

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>{texts.title}</h2>

      <Checkbox
        checked={settings.enabled}
        data-testid="sub-task-progress-board-settings-enabled-checkbox"
        onChange={toggleEnabled}
        style={{ marginBottom: '16px' }}
      >
        {texts.enableFeature}
      </Checkbox>

      <Button
        type="primary"
        onClick={resetBoardProperty}
        disabled={!settings.enabled}
        data-testid="reset-board-property-button"
      >
        {texts.resetButton}
      </Button>

      <UserGuide />

      <ColumnsSettingsContainer />
      <CountSettings />

      <GroupingSettings />
    </div>
  );
};
