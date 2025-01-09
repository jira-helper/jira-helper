import { Ok } from 'ts-results';
import { JiraService } from './jiraService';

export const loadJiraIssues = async (issueId: string) => {
  const issue = await JiraService.getInstance().fetchJiraIssue(issueId);
  if (issue) {
    return Ok(issue);
  }

  try {
    const apiJiraIssue = await this.queue.register({
      key: `fetchJiraIssue-${issueId}`,
      cb: () => getJiraIssue(issueId),
      abortSignal,
    });

    const mappedJiraIssue = mapJiraIssue(apiJiraIssue);
    this.jiraIssuesService.updateJiraIssue(issueId, mappedJiraIssue);
    return Ok(mappedJiraIssue);
  } catch (error) {
    if (error instanceof Error) {
      const message = `Failed to fetch Jira issue ${issueId}: ${error.message}`;
      error.message = message;
      return Err(error);
    }
    return Err(new Error(`Unknown error: ${error}`));
  }
};
