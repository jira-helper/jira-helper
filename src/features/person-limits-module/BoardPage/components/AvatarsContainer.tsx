import React from 'react';
import { useDi } from 'src/infrastructure/di/diContext';
import { buildAvatarUrlToken } from 'src/infrastructure/di/jiraApiTokens';
import { boardRuntimeModelToken } from '../../tokens';
import { AvatarBadge } from './AvatarBadge';

/**
 * Container component for person limit avatars.
 *
 * Subscribes to BoardRuntimeModel and renders avatar badges for each person.
 * Handles click events to toggle person filter.
 */
export const AvatarsContainer: React.FC = () => {
  const container = useDi();
  const buildAvatarUrl = container.inject(buildAvatarUrlToken);
  const { model, useModel } = container.inject(boardRuntimeModelToken);
  const { stats, activeLimitId } = useModel();

  const handleClick = (limitId: number) => {
    model.toggleActiveLimitId(limitId);
  };

  if (stats.length === 0) {
    return null;
  }

  return (
    <div id="avatars-limits" style={{ display: 'inline-flex', marginLeft: 30 }}>
      {stats.map(stat => (
        <AvatarBadge
          key={stat.id}
          avatar={buildAvatarUrl(stat.person.name)}
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
