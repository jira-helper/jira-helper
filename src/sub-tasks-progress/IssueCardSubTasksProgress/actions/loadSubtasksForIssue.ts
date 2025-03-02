import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useJiraExternalIssuesStore } from 'src/shared/jira/stores/jiraExternalIssues';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { useJiraSubtasksStore } from '../../../shared/jira/stores/jiraSubtasks';
import { loadIssue } from '../../actions/loadIssue';
import { useSubTaskProgressBoardPropertyStore } from '../../stores/subTaskProgressBoardProperty';

const innerLoadSubtasksForIssue = createAction({
  name: 'loadSubtasksForIssue',
  async handler(issueId: string, abortSignal: AbortSignal) {
    const log = this.di.inject(loggerToken).getPrefixedLog(`innerLoadSubtasksForIssue ${issueId}`);
    const issueSubTasks = useJiraSubtasksStore.getState().data[issueId];
    if (issueSubTasks?.state === 'loaded' || issueSubTasks?.state === 'loading') {
      log('skip because loaded or loading');
      return;
    }

    log('start load issue');
    await loadIssue(issueId, abortSignal);

    useJiraSubtasksStore.getState().actions.startLoadingSubtasks(issueId);

    log('start load subtasks');
    const result = await this.di.inject(JiraServiceToken).fetchSubtasks(issueId, abortSignal);

    if (result.err) {
      log(`error while loading subtasks ${result.val.message}`);
      useJiraSubtasksStore.getState().actions.removeSubtasks(issueId);
      return;
    }

    useJiraSubtasksStore.getState().actions.addSubtasks(issueId, result.val);
  },
});

const loadExternalIssuesForIssue = createAction({
  name: 'loadExternalIssuesForIssue',
  async handler(issueKey: string, abortSignal: AbortSignal) {
    const logger = this.di.inject(loggerToken);
    const log = logger.getPrefixedLog(`loadExternalIssuesForIssue: ${issueKey}`);

    const issueExternalIssues = useJiraExternalIssuesStore.getState().data[issueKey];
    if (issueExternalIssues?.state === 'loaded' || issueExternalIssues?.state === 'loading') {
      log('already loaded - skip', 'info');
      return;
    }

    useJiraExternalIssuesStore.getState().actions.startLoadingExternalIssues(issueKey);

    const jiraService = this.di.inject(JiraServiceToken);
    let issueData = useJiraIssuesStore.getState().issues.find(i => i.data.key === issueKey);
    if (!issueData) {
      log('no issue data, start loading issue', 'info');
      await loadIssue(issueKey, abortSignal);
      issueData = useJiraIssuesStore.getState().issues.find(i => i.data.key === issueKey);
    }

    if (!issueData) {
      log('loaded issue but no data after loading finished', 'warn');
      useJiraExternalIssuesStore.getState().actions.addExternalIssues(issueKey, []);
      return;
    }

    const settings = useSubTaskProgressBoardPropertyStore.getState().data;

    if (!settings.countEpicExternalLinks && issueData.data.issueType === 'Epic') {
      log('skip epic');
      useJiraExternalIssuesStore.getState().actions.addExternalIssues(issueKey, []);
      return;
    }

    if (!settings.countIssuesExternalLinks && issueData.data.issueType === 'Task') {
      log('skip task');
      useJiraExternalIssuesStore.getState().actions.addExternalIssues(issueKey, []);
      return;
    }

    if (!settings.countSubtasksExternalLinks && issueData.data.issueType === 'Sub-task') {
      log('skip sub-task');
      useJiraExternalIssuesStore.getState().actions.addExternalIssues(issueKey, []);
      return;
    }

    log('start loading external issues');
    const result = await jiraService.getExternalIssues(issueKey, abortSignal);

    if (result.err) {
      log(`failed to load external issues ${result.val.message}`, 'error');
      useJiraExternalIssuesStore.getState().actions.removeExternalIssues(issueKey);
      return;
    }

    useJiraExternalIssuesStore.getState().actions.addExternalIssues(issueKey, result.val);
  },
});

export const loadSubtasksForIssue = createAction({
  name: 'loadSubtasskForIssue',
  handler: (issueKey: string, abortSignal: AbortSignal) => {
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
  },
});
