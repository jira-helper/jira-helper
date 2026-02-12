import React from 'react';
import { Button } from 'antd';
import { settingsJiraDOM } from '../../constants';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, disabled = false }) => (
  <Button id={settingsJiraDOM.openEditorBtn} type="primary" onClick={onClick} disabled={disabled}>
    Manage per-person WIP-limits
  </Button>
);
