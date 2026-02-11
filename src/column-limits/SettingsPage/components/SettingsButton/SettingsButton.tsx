import React from 'react';
import styles from './SettingsButton.module.css';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, disabled = false }) => (
  <button id="jh-add-group-btn" className={styles.button} onClick={onClick} disabled={disabled} type="button">
    Group limits
  </button>
);
