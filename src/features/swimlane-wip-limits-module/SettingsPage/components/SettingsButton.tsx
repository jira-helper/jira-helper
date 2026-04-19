import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { settingsUIModelToken } from '../../tokens';
import { useDi } from 'src/infrastructure/di/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { SWIMLANE_WIP_LIMITS_TEXTS } from '../../texts';
import type { SettingsUIModel } from '../models/SettingsUIModel';

export const SettingsButton: React.FC = () => {
  const { model } = useDi().inject(settingsUIModelToken);
  const texts = useGetTextsByLocale(SWIMLANE_WIP_LIMITS_TEXTS);

  const handleClick = async () => {
    await (model as SettingsUIModel).open();
  };

  return (
    <Button type="primary" icon={<SettingOutlined />} onClick={handleClick} data-testid="swimlane-settings-button">
      {texts.settingsButton}
    </Button>
  );
};
