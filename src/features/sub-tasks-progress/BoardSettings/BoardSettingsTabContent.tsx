import React from 'react';

import { Button, Divider } from 'antd';

import { resetBoardProperty } from 'src/features/sub-tasks-progress/BoardSettings/actions/resetBoardProperty';

import { ColumnsSettingsContainer } from 'src/features/sub-tasks-progress/BoardSettings/ColumnSettings/ColumnSettings';
import { CountSettings } from 'src/features/sub-tasks-progress/BoardSettings/CountSettings/CountSettings';
import { GroupingSettings } from 'src/features/sub-tasks-progress/BoardSettings/GroupingSettings/GroupingSettings';
import { ColorSchemeChooser } from 'src/features/sub-tasks-progress/BoardSettings/ColorSchemeSettings/ColorSchemeChooser';
import { useGetTextsByLocale } from 'src/shared/texts';

const TEXTS = {
  title: {
    en: 'Sub-tasks progress',
    ru: 'Прогресс подзадач',
  },
  resetButton: {
    en: 'Reset all settings',
    ru: 'Сброс всех настроек',
  },
};

export const BoardSettingsTabContent = () => {
  const texts = useGetTextsByLocale(TEXTS);

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>{texts.title}</h2>
      <Button type="primary" onClick={resetBoardProperty}>
        {texts.resetButton}
      </Button>

      <Divider />

      <GroupingSettings />
      <CountSettings />
      <ColumnsSettingsContainer />

      <ColorSchemeChooser />
    </div>
  );
};
