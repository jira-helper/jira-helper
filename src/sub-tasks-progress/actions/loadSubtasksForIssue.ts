import { globalContainer } from 'dioma';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useJiraSubtasksStore } from '../../shared/jira/stores/jiraSubtasks/jiraSubtasks';

export const loadSubtasksForIssue = async (issueId: string, abortSignal: AbortSignal) => {
  console.log('start loadSubtasksForIssue', issueId);
  const issueSubTasks = useJiraSubtasksStore.getState().data[issueId];
  if (issueSubTasks?.state === 'loaded' || issueSubTasks?.state === 'loading') {
    console.log('issueSubTasks is loaded or loading');
    return;
  }

  useJiraSubtasksStore.getState().actions.startLoadingSubtasks(issueId);

  console.log('fetching subtasks');
  const result = await globalContainer.inject(JiraServiceToken).fetchSubtasks(issueId, abortSignal);
  console.log('result', result);
  if (result.err) {
    console.log('error fetching subtasks');
    useJiraSubtasksStore.getState().actions.removeSubtasks(issueId);
    return;
  }

  useJiraSubtasksStore.getState().actions.addSubtasks(issueId, result.val);
  console.log('subtasks added');
};
