import React from 'react';
import { Button } from 'antd';
import { settingsJiraDOM } from '../../constants';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

/**
 * SettingsButton - View компонент кнопки для открытия модального окна редактирования WIP limits.
 */
export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, disabled = false, label }) => (
  <Button id={settingsJiraDOM.editLimitsBtn} type="primary" onClick={onClick} disabled={disabled}>
    {label}
  </Button>
);
