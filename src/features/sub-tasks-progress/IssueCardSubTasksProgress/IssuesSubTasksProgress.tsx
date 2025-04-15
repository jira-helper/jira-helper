import React, { useEffect } from 'react';
import { loadSubtasksForIssue } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/actions/loadSubtasksForIssue';

import { useSubtasksProgress } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { colorSchemas } from 'src/features/sub-tasks-progress/colorSchemas';
import { useDi, WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';

import { globalContainer } from 'dioma';
import { useGetSettings } from '../SubTaskProgressSettings/hooks/useGetSettings';
import { SubTaskProgressByGroup } from '../SubTasksProgress/SubTaskProgressByGroup';

const IssuesSubTasksProgress = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  const container = useDi();
  const boardPage = container.inject(boardPagePageObjectToken);
  const issueColumn = boardPage.getColumnOfIssue(issueId);

  const shouldTrackIssue = settings?.columnsToTrack?.includes(issueColumn) && settings?.enabled;

  useEffect(() => {
    if (!shouldTrackIssue) {
      return;
    }

    const abortController = new AbortController();
    loadSubtasksForIssue(issueId, abortController.signal);

    return () => abortController.abort();
  }, [shouldTrackIssue, issueId]);

  const subtasksProgressByGroup = useSubtasksProgress(issueId);

  if (!shouldTrackIssue) {
    return null;
  }

  if (Object.keys(subtasksProgressByGroup).length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Object.entries(subtasksProgressByGroup).map(([group, progress]) => (
        <SubTaskProgressByGroup
          key={group}
          groupName={group}
          progress={progress.progress}
          warning={
            progress.comments.length > 0 ? (
              <div>
                {progress.comments.map(comment => (
                  <div key={comment}>{comment}</div>
                ))}
              </div>
            ) : undefined
          }
          colorScheme={colorSchemas[settings?.selectedColorScheme || 'jira']}
        />
      ))}
    </div>
  );
};

export const IssuesSubTasksProgressContainer = (props: { issueId: string }) => {
  const container = globalContainer;
  return (
    <WithDi container={container}>
      <IssuesSubTasksProgress {...props} />
    </WithDi>
  );
};
