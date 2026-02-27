import React from 'react';
import cn from 'classnames';
import styles from './AvatarBadge.module.css';

export type AvatarBadgeStatus = 'under' | 'at' | 'over';

export type AvatarBadgeProps = {
  /** URL of the avatar image */
  avatar: string;
  /** @deprecated Use personName for tooltip. Kept for backward compat. */
  displayName?: string;
  /** Person's login name (used for identification) */
  personName: string;
  /** Unique ID of the limit */
  limitId: number;
  /** Current number of issues */
  currentCount: number;
  /** Maximum allowed issues */
  limit: number;
  /** Whether this avatar is currently selected for filtering */
  isActive: boolean;
  /** Click handler - receives limitId of clicked avatar */
  onClick: (limitId: number) => void;
};

/**
 * Determines the status based on current count vs limit.
 */
export const getStatus = (currentCount: number, limit: number): AvatarBadgeStatus => {
  if (currentCount > limit) return 'over';
  if (currentCount === limit) return 'at';
  return 'under';
};

/**
 * Single avatar with WIP limit badge.
 *
 * Displays:
 * - User avatar image
 * - Current/limit counter
 * - Color-coded status (green/yellow/red)
 * - Active state border when selected
 */
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

  return (
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
      <img
        src={avatar}
        title={personName}
        alt={personName}
        className={cn(styles.avatarImage, 'jira-tooltip', { [styles.active]: isActive })}
      />
      <div className={cn(styles.badge, styles[status])} data-status={status}>
        {currentCount} / {limit}
      </div>
    </div>
  );
};
