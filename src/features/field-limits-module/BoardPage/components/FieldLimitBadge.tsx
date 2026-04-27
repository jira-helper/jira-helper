/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { Tooltip } from 'antd';
import styles from './FieldLimitBadge.module.css';

export interface FieldLimitBadgeProps {
  visualValue: string;
  current: number;
  limit: number;
  badgeColor: string;
  bkgColor?: string;
  tooltip: string;
}

export const FieldLimitBadge: React.FC<FieldLimitBadgeProps> = ({
  visualValue,
  current,
  limit,
  badgeColor,
  bkgColor,
  tooltip,
}) => (
  <Tooltip title={tooltip}>
    <div
      className={styles.badge}
      style={bkgColor ? { backgroundColor: bkgColor } : undefined}
      data-testid="field-limit-badge"
    >
      <div>
        <span>{visualValue}</span>
      </div>
      <div className={styles.stats} style={{ backgroundColor: badgeColor }}>
        {current}/{limit}
      </div>
    </div>
  </Tooltip>
);
