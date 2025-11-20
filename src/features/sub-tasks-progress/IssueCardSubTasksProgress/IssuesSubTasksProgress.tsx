import React, { useEffect } from 'react';
import { loadSubtasksForIssue } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/actions/loadSubtasksForIssue';
import {
  useSubtasksProgress,
  useSubtasksProgressByCustomGroup,
} from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { useDi, WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';

import { globalContainer } from 'dioma';
import cn from 'classnames';
import styles from './IssuesSubTasksProgress.module.css';
import { useGetSettings } from '../SubTaskProgressSettings/hooks/useGetSettings';
import { SubTaskProgressByGroup } from '../SubTasksProgress/SubTaskProgressByGroup';
import { SubTasksProgress } from '../types';

import { CounterComponent } from '../SubTasksProgress/CounterComponent';

type SubtasksProgressBar = {
  groupId: string;
  groupName: string;
  progress: SubTasksProgress;
  comments: string[];
};

type SubtasksProgressCounter = {
  groupId: string;
  groupName: string;
  progress: SubTasksProgress;
  comments: string[];
  pendingColor: string;
  doneColor: string;
  showOnlyIncomplete: boolean;
};

export const IssuesSubTasksProgressPure = (props: {
  progressBarsDisplayMode: 'splitLines' | 'singleLine';
  subtasksProgressBars: SubtasksProgressBar[];
  subtasksProgressCounters: SubtasksProgressCounter[];
}) => {
  const { progressBarsDisplayMode, subtasksProgressBars, subtasksProgressCounters } = props;
  return (
    <div>
      <div className={cn(styles.container, progressBarsDisplayMode === 'splitLines' && styles.splitLines)}>
        {subtasksProgressBars.map(({ groupName: group, groupId, progress, comments }) => (
          <SubTaskProgressByGroup
            key={groupId}
            groupName={group}
            progress={progress}
            warning={
              comments.length > 0 ? (
                <div>
                  {comments.map(comment => (
                    <div key={comment}>{comment}</div>
                  ))}
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
      <div className={styles.countersContainer}>
        {subtasksProgressCounters.map(
          ({ groupName: group, groupId, progress, comments, pendingColor, doneColor, showOnlyIncomplete }) => (
            <CounterComponent
              key={groupId}
              groupName={group}
              progress={progress}
              comments={comments}
              pendingColor={pendingColor}
              doneColor={doneColor}
              showOnlyIncomplete={showOnlyIncomplete}
            />
          )
        )}
      </div>
    </div>
  );
};

const IssuesSubTasksProgress = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  const { customGroups } = settings;

  const subtasksProgressByGroup = useSubtasksProgress(issueId);
  const customGroupsProgress = useSubtasksProgressByCustomGroup(issueId);

  const subtasksProgressBars: SubtasksProgressBar[] = [];
  const subtasksProgressCounters: SubtasksProgressCounter[] = [];

  for (const groupName in subtasksProgressByGroup) {
    if (settings.showGroupsByFieldAsCounters) {
      const total = Object.values(subtasksProgressByGroup[groupName].progress).reduce((acc, curr) => acc + curr, 0);
      const { done } = subtasksProgressByGroup[groupName].progress;

      const isComplete = done === total;

      if (settings.groupByFieldHideIfCompleted && isComplete) {
        continue;
      }

      if (settings.groupByFieldShowOnlyIncomplete && isComplete) {
        continue;
      }

      subtasksProgressCounters.push({
        groupName,
        progress: subtasksProgressByGroup[groupName].progress,
        comments: subtasksProgressByGroup[groupName].comments,
        groupId: `auto-group-by-field-${groupName}`,
        pendingColor: settings.groupByFieldPendingColor,
        doneColor: settings.groupByFieldDoneColor,
        showOnlyIncomplete: settings.groupByFieldShowOnlyIncomplete || false,
      });
    } else {
      subtasksProgressBars.push({
        groupName,
        progress: subtasksProgressByGroup[groupName].progress,
        comments: subtasksProgressByGroup[groupName].comments,
        groupId: `auto-group-by-field-${groupName}`,
      });
    }
  }

  for (const cgid in customGroupsProgress) {
    const customGroupProgress = customGroupsProgress[cgid];
    const customGroup = customGroups.find(cg => cg.id === parseInt(cgid, 10));

    if (!customGroup) continue;

    const total = Object.values(customGroupProgress.progress).reduce((acc, curr) => acc + curr, 0);
    const { done } = customGroupProgress.progress;
    const isComplete = done === total;
    if (customGroup.hideCompleted && isComplete) {
      continue;
    }

    if (customGroup.showOnlyIncomplete && isComplete) {
      continue;
    }

    if (customGroup.showAsCounter) {
      subtasksProgressCounters.push({
        groupName: customGroup.name,
        progress: customGroupProgress.progress,
        comments: customGroupProgress.comments,
        groupId: customGroup.id.toString(),
        pendingColor: customGroup.badgePendingColor,
        doneColor: customGroup.badgeDoneColor,
        showOnlyIncomplete: customGroup.showOnlyIncomplete,
      });
    } else {
      subtasksProgressBars.push({
        groupName: customGroup.name,
        progress: customGroupProgress.progress,
        comments: customGroupProgress.comments,
        groupId: customGroup.id.toString(),
      });
    }
  }

  if (subtasksProgressBars.length === 0 && subtasksProgressCounters.length === 0) {
    return null;
  }

  return (
    <IssuesSubTasksProgressPure
      subtasksProgressBars={subtasksProgressBars}
      subtasksProgressCounters={subtasksProgressCounters}
      progressBarsDisplayMode={settings?.subtasksProgressDisplayMode}
    />
  );
};

const IssueSubTasksProgressWrapper = (props: { issueId: string }) => {
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

  if (!shouldTrackIssue) {
    return null;
  }

  return <IssuesSubTasksProgress {...props} />;
};

export const IssuesSubTasksProgressContainer = (props: { issueId: string }) => {
  const container = globalContainer;
  return (
    <WithDi container={container}>
      <IssueSubTasksProgressWrapper {...props} />
    </WithDi>
  );
};
