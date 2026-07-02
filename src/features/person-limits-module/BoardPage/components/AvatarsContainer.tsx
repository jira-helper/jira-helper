/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
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
  const { stats, activePerson } = useModel();

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
          // Shared limits: all avatars share the bucket and click highlights the whole limit.
          // Per-person limits: each avatar carries its own counter and highlight target.
          const isShared = stat.sharedLimit;
          const currentCount = isShared ? stat.issues.length : personIssues.length;
          const isActive = isShared
            ? activePerson?.limitId === stat.id
            : activePerson?.limitId === stat.id && activePerson?.personName === person.name;
          const handleClick = (limitId: number) => {
            model.toggleActivePerson(limitId, isShared ? null : person.name);
          };
          return (
            <AvatarBadge
              key={`${stat.id}-${person.name}`}
              avatar={buildAvatarUrl(person.name)}
              personName={person.name}
              limitId={stat.id}
              currentCount={currentCount}
              limit={stat.limit}
              isActive={isActive}
              onClick={handleClick}
            />
          );
        })
      )}
    </div>
  );
};
