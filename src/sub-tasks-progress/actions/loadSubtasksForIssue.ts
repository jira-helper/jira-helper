import { globalContainer } from 'dioma';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useJiraExternalIssuesStore } from 'src/shared/jira/stores/jiraExternalIssues/jiraExternalIssues';
import { useJiraSubtasksStore } from '../../shared/jira/stores/jiraSubtasks/jiraSubtasks';
import { loadIssue } from './loadIssue';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

const innerLoadSubtasksForIssue = async (issueId: string, abortSignal: AbortSignal) => {
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

const loadExternalIssuesForIssue = async (issueKey: string, abortSignal: AbortSignal) => {
  const issueExternalIssues = useJiraExternalIssuesStore.getState().data[issueKey];
  if (issueExternalIssues?.state === 'loaded' || issueExternalIssues?.state === 'loading') {
    return;
  }

  useJiraExternalIssuesStore.getState().actions.startLoadingExternalIssues(issueKey);

  const result = await globalContainer.inject(JiraServiceToken).getExternalIssues(issueKey, abortSignal);

  if (result.err) {
    useJiraExternalIssuesStore.getState().actions.removeExternalIssues(issueKey);
    return;
  }

  useJiraExternalIssuesStore.getState().actions.addExternalIssues(issueKey, result.val);
};

export const loadSubtasksForIssue = async (issueKey: string, abortSignal: AbortSignal) => {
  const settings = useSubTaskProgressBoardPropertyStore.getState().data;
  const ifEnabledAnyCountForSubtasks =
    settings.countEpicIssues ||
    settings.countEpicLinkedIssues ||
    settings.countIssuesSubtasks ||
    settings.countIssuesLinkedIssues ||
    settings.countSubtasksLinkedIssues;

  const ifEnabledExternalCount =
    settings.countIssuesExternalLinks || settings.countSubtasksExternalLinks || settings.countEpicExternalLinks;

  return Promise.all(
    [
      ifEnabledAnyCountForSubtasks && innerLoadSubtasksForIssue(issueKey, abortSignal),
      ifEnabledExternalCount && loadExternalIssuesForIssue(issueKey, abortSignal),
    ].filter(Boolean)
  );
};
