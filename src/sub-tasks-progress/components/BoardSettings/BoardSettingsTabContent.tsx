import React from 'react';

import { Divider } from 'antd';

import { resetBoardProperty } from 'src/sub-tasks-progress/actions/resetBoardProperty';

import { ColumnsSettingsContainer } from 'src/sub-tasks-progress/BoardSettings/ColumnSettings/ColumnSettings';
import { CountSettings } from 'src/sub-tasks-progress/BoardSettings/CountSettings/CountSettings';
import { GroupingSettings } from 'src/sub-tasks-progress/BoardSettings/GroupingSettings/GroupingSettings';
import { ColorSchemeChooser } from 'src/sub-tasks-progress/BoardSettings/ColorSchemeSettings/ColorSchemeChooser';

export const BoardSettingsTabContent = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>Sub-tasks progress</h2>
      <button type="button" onClick={resetBoardProperty}>
        Reset
      </button>

      <Divider />

      <GroupingSettings />
      <CountSettings />
      <ColumnsSettingsContainer />

      <ColorSchemeChooser />
    </div>
  );
};
