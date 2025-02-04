import { globalContainer } from 'dioma';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useJiraSubtasksStore } from '../../shared/jira/stores/jiraSubtasks/jiraSubtasks';
import { loadIssue } from './loadIssue';

export const loadSubtasksForIssue = async (issueId: string, abortSignal: AbortSignal) => {
  const issueSubTasks = useJiraSubtasksStore.getState().data[issueId];
  if (issueSubTasks?.state === 'loaded' || issueSubTasks?.state === 'loading') {
    return;
  }

  await loadIssue(issueId, abortSignal);

  useJiraSubtasksStore.getState().actions.startLoadingSubtasks(issueId);

  const result = await globalContainer.inject(JiraServiceToken).fetchSubtasks(issueId, abortSignal);

  if (result.err) {
    useJiraSubtasksStore.getState().actions.removeSubtasks(issueId);
    return;
  }

  useJiraSubtasksStore.getState().actions.addSubtasks(issueId, result.val);
};
