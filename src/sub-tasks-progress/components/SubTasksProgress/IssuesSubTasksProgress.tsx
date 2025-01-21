import React, { useEffect } from 'react';
import { loadSubtasksForIssue } from 'src/sub-tasks-progress/actions/loadSubtasksForIssue';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';
import { useShallow } from 'zustand/react/shallow';
import { useSubtasksProgress } from 'src/sub-tasks-progress/hooks/useSubtasksProgress';
import { colorSchemas } from 'src/sub-tasks-progress/colorSchemas';
import { useDi } from 'src/shared/diContext';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { globalContainer } from 'dioma';
import { useGetSettings } from '../../hooks/useGetSettings';
import { SubTaskProgressByGroup } from './SubTaskProgressByGroup';

export const IssuesSubTasksProgress = (props: { issueId: string }) => {
  const { settings } = useGetSettings();
  const { issueId } = props;
  // TODO: заменить на локальный контейнер
  const boardPage = globalContainer.inject(boardPagePageObjectToken);
  const issueColumn = boardPage.getColumnOfIssue(issueId);
  console.log('🚀 ~ IssuesSubTasksProgress ~ issueColumn:', issueColumn);
  const shouldTrackIssue = settings?.columnsToTrack?.includes(issueColumn);
  console.log('🚀 ~ IssuesSubTasksProgress ~ shouldTrackIssue:', shouldTrackIssue);
  console.log('🚀 ~ IssuesSubTasksProgress ~ settings?.columnsToTrack:', settings?.columnsToTrack);

  const data = useJiraSubtasksStore(useShallow(state => state.data[issueId]));
  console.log('render');
  useEffect(() => {
    console.log('useEffetct');
    if (!shouldTrackIssue) {
      console.log('shouldTrackIssue is false');
      return;
    }

    const abortController = new AbortController();
    console.log('loadSubtasksForIssue');
    loadSubtasksForIssue(issueId, abortController.signal);

    return () => abortController.abort();
  }, [shouldTrackIssue]);

  const subtasksProgressByGroup = useSubtasksProgress(data?.subtasks || [], data?.externalLinks || []);

  if (!shouldTrackIssue) {
    console.log('shouldTrackIssue is false');
    return null;
  }

  if (!data || data.state !== 'loaded') {
    console.log('data is not loaded');
    return null;
  }

  if (Object.keys(subtasksProgressByGroup).length === 0) {
    console.log('subtasksProgressByGroup is empty');
    return null;
  }

  console.log('subtasksProgressByGroup render');
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
