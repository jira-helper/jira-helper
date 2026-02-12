import React from 'react';
import { Button } from 'antd';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, disabled = false }) => (
  <Button id="jh-add-group-btn" type="primary" onClick={onClick} disabled={disabled}>
    Group limits
  </Button>
);
