import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { settingsUIModelToken } from '../../tokens';
import { useDi } from 'src/shared/diContext';
import type { SettingsUIModel } from '../models/SettingsUIModel';

export const SettingsButton: React.FC = () => {
  const { model } = useDi().inject(settingsUIModelToken);

  const handleClick = async () => {
    await (model as SettingsUIModel).open();
  };

  return (
    <Button type="primary" icon={<SettingOutlined />} onClick={handleClick} data-testid="swimlane-settings-button">
      Configure WIP Limits
    </Button>
  );
};
