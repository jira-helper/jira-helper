import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => (
  <Button type="primary" icon={<SettingOutlined />} onClick={onClick} data-testid="field-limits-settings-button">
    Edit WIP limits by field
  </Button>
);
