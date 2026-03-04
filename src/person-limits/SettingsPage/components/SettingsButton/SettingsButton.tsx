import React from 'react';
import { Button } from 'antd';
import { settingsJiraDOM } from '../../constants';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, disabled = false, label }) => (
  <Button id={settingsJiraDOM.openEditorBtn} type="primary" onClick={onClick} disabled={disabled}>
    {label}
  </Button>
);
