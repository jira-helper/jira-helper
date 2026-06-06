import React from 'react';
import { Button } from 'antd';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, disabled = false, label }) => (
  <Button id="jh-add-group-btn" type="primary" onClick={onClick} disabled={disabled}>
    {label}
  </Button>
);
