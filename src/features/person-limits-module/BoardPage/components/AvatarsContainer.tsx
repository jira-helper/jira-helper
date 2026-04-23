import React from 'react';
import { useDi } from 'src/infrastructure/di/diContext';
import { buildAvatarUrlToken } from 'src/infrastructure/di/jiraApiTokens';
import { boardRuntimeModelToken } from '../../tokens';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { AvatarBadge } from './AvatarBadge';

export const AvatarsContainer: React.FC = () => {
  const container = useDi();
  const buildAvatarUrl = container.inject(buildAvatarUrlToken);
  const pageObject = container.inject(boardPagePageObjectToken);
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
      {stats.flatMap(stat =>
        stat.persons.map(person => {
          const personIssues = stat.issues.filter(issue => {
            const assignee = pageObject.getAssigneeFromIssue(issue);
            return assignee === person.name || assignee === person.displayName;
          });
          return (
            <AvatarBadge
              key={`${stat.id}-${person.name}`}
              avatar={buildAvatarUrl(person.name)}
              personName={person.name}
              limitId={stat.id}
              currentCount={personIssues.length}
              limit={stat.limit}
              isActive={activeLimitId === stat.id}
              onClick={handleClick}
            />
          );
        })
      )}
    </div>
  );
};
