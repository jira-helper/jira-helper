import React from 'react';
import { useRuntimeStore } from '../stores';
import { showOnlyChosen } from '../actions';
import { AvatarBadge } from './AvatarBadge';

/**
 * Container component for person limit avatars.
 *
 * Subscribes to runtime store and renders avatar badges for each person.
 * Handles click events to toggle person filter.
 */
export const AvatarsContainer: React.FC = () => {
  const stats = useRuntimeStore(s => s.data.stats);
  const activeLimitId = useRuntimeStore(s => s.data.activeLimitId);
  const { toggleActiveLimitId } = useRuntimeStore(s => s.actions);

  const handleClick = (limitId: number) => {
    toggleActiveLimitId(limitId);
    // Apply filter after state update
    setTimeout(() => {
      showOnlyChosen();
    }, 0);
  };

  if (stats.length === 0) {
    return null;
  }

  return (
    <div id="avatars-limits" style={{ display: 'inline-flex', marginLeft: 30 }}>
      {stats.map(stat => (
        <AvatarBadge
          key={stat.id}
          avatar={stat.person.avatar}
          personName={stat.person.name}
          limitId={stat.id}
          currentCount={stat.issues.length}
          limit={stat.limit}
          isActive={activeLimitId === stat.id}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};
