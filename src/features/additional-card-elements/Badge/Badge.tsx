import React from 'react';
import { Tooltip } from 'antd';
import styles from './Badge.module.css';

export type BadgeColor = 'blue' | 'yellow' | 'red';

export interface BadgeProps {
  color: BadgeColor;
  tooltip?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ color, tooltip, children }) => {
  const badge = <span className={`${styles.badge} ${styles[`badge-${color}`]}`}>{children}</span>;

  if (tooltip) {
    return <Tooltip title={tooltip}>{badge}</Tooltip>;
  }

  return badge;
};
