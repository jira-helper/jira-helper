import React from 'react';
import cn from 'classnames';
import { Tooltip } from 'antd';
import styles from './AvatarBadge.module.css';

export type AvatarBadgeStatus = 'under' | 'at' | 'over';

export type AvatarBadgeProps = {
  avatar: string;
  displayName?: string;
  personName: string;
  limitId: number;
  currentCount: number;
  limit: number;
  isActive: boolean;
  onClick: (limitId: number) => void;
};

export const getStatus = (currentCount: number, limit: number): AvatarBadgeStatus => {
  if (currentCount > limit) return 'over';
  if (currentCount === limit) return 'at';
  return 'under';
};

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatar,
  personName,
  limitId,
  currentCount,
  limit,
  isActive,
  onClick,
}) => {
  const status = getStatus(currentCount, limit);

  const handleClick = () => {
    onClick(limitId);
  };

  const letter = personName ? personName.charAt(0).toUpperCase() : '?';

  return (
    <Tooltip title={personName}>
      <div
        className={styles.avatar}
        data-person-name={personName}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <span className={cn(styles.fallback, { [styles.active]: isActive })}>
          {letter}
        </span>
        <img
          src={avatar}
          alt={personName}
          title={personName}
          className={cn(styles.avatarImage, 'jira-tooltip', { [styles.active]: isActive })}
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className={cn(styles.badge, styles[status])} data-status={status}>
          {currentCount}/{limit}
        </div>
      </div>
    </Tooltip>
  );
};
