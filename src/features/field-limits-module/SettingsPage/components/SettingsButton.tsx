import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export interface SettingsButtonProps {
  onClick: () => void;
  label: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, label }) => (
  <Button type="primary" icon={<SettingOutlined />} onClick={onClick} data-testid="field-limits-settings-button">
    {label}
  </Button>
);
