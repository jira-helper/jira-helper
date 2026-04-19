import React from 'react';
import { Badge, Tooltip } from 'antd';
import styles from './LimitBadge.module.css';

export interface LimitBadgeProps {
  count: number;
  limit: number;
  exceeded: boolean;
}

export const LimitBadge: React.FC<LimitBadgeProps> = ({ count, limit, exceeded }) => (
  <Tooltip title="Issues / Max. issues">
    <span className={styles.badge} data-testid="limit-badge">
      <Badge
        count={`${count}/${limit}`}
        style={{
          backgroundColor: exceeded ? '#ff4d4f' : '#52c41a',
          fontWeight: 500,
        }}
        showZero
      />
    </span>
  </Tooltip>
);
