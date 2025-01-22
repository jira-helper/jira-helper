import React, { useEffect } from 'react';
import { loadSubtasksForIssue } from 'src/sub-tasks-progress/actions/loadSubtasksForIssue';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';
import { useShallow } from 'zustand/react/shallow';
import { useSubtasksProgress } from 'src/sub-tasks-progress/hooks/useSubtasksProgress';
import { colorSchemas } from 'src/sub-tasks-progress/colorSchemas';
import { useDi, WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';

import { globalContainer } from 'dioma';
import { useGetSettings } from '../../hooks/useGetSettings';
import { SubTaskProgressByGroup } from './SubTaskProgressByGroup';

const IssuesSubTasksProgress = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  const container = useDi();
  const boardPage = container.inject(boardPagePageObjectToken);
  const issueColumn = boardPage.getColumnOfIssue(issueId);

  const shouldTrackIssue = settings?.columnsToTrack?.includes(issueColumn);

  const data = useJiraSubtasksStore(useShallow(state => state.data[issueId]));
  useEffect(() => {
    if (!shouldTrackIssue) {
      return;
    }

    const abortController = new AbortController();
    loadSubtasksForIssue(issueId, abortController.signal);

    return () => abortController.abort();
  }, [shouldTrackIssue]);

  const subtasksProgressByGroup = useSubtasksProgress(data?.subtasks || [], data?.externalLinks || []);

  if (!shouldTrackIssue) {
    return null;
  }

  if (!data || data.state !== 'loaded') {
    return null;
  }

  if (Object.keys(subtasksProgressByGroup).length === 0) {
    return null;
  }

  return (
    <div>
      {Object.entries(subtasksProgressByGroup).map(([group, progress]) => (
        <SubTaskProgressByGroup
          key={group}
          groupName={group}
          progress={progress}
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
