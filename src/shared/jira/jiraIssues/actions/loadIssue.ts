import { globalContainer } from 'dioma';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';

export const loadIssue = async (issueKey: string, abortSignal: AbortSignal) => {
  const issue = useJiraIssuesStore.getState().issues.find(i => i.data.key === issueKey);
  if (issue) {
    return;
  }

  const result = await globalContainer.inject(JiraServiceToken).fetchJiraIssue(issueKey, abortSignal);

  if (result.err) {
    return;
  }

  useJiraIssuesStore.getState().actions.addIssue(result.val);
};
