import React, { useEffect } from 'react';
import { loadSubtasksForIssue } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/actions/loadSubtasksForIssue';
import {
  SubTasksProgressByGroup,
  useSubtasksProgress,
} from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { colorSchemas } from 'src/features/sub-tasks-progress/colorSchemas';
import { useDi, WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';

import { globalContainer } from 'dioma';
import cn from 'classnames';
import styles from './IssuesSubTasksProgress.module.css';
import { useGetSettings } from '../SubTaskProgressSettings/hooks/useGetSettings';
import { SubTaskProgressByGroup } from '../SubTasksProgress/SubTaskProgressByGroup';
import { ColorScheme } from '../types';

export const IssuesSubTasksProgressPure = (props: {
  subtasksProgressByGroup: SubTasksProgressByGroup;
  colorScheme: ColorScheme;
  displayMode: 'splitLines' | 'singleLine';
}) => {
  const { subtasksProgressByGroup, colorScheme, displayMode } = props;
  return (
    <div className={cn(styles.container, displayMode === 'splitLines' && styles.splitLines)}>
      {Object.entries(subtasksProgressByGroup).map(([group, progress]) => (
        <SubTaskProgressByGroup
          key={group}
          groupName={group}
          progress={progress.progress}
          colorScheme={colorScheme}
          warning={
            progress.comments.length > 0 ? (
              <div>
                {progress.comments.map(comment => (
                  <div key={comment}>{comment}</div>
                ))}
              </div>
            ) : undefined
          }
        />
      ))}
    </div>
  );
};

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
    <IssuesSubTasksProgressPure
      subtasksProgressByGroup={subtasksProgressByGroup}
      colorScheme={colorSchemas[settings?.selectedColorScheme || 'jira']}
      displayMode={settings?.subtasksProgressDisplayMode}
    />
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
