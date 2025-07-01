import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useJiraExternalIssuesStore } from 'src/shared/jira/stores/jiraExternalIssues';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { loadIssue } from 'src/shared/jira/jiraIssues/actions/loadIssue';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';

type IssueId = string;
type LoadingProcess = { mergedAbortController: AbortController; signals: AbortSignal[] };
const loadingProcessMap = new Map<IssueId, LoadingProcess>();
const registerAbortSignal = (issueId: IssueId, abortSignal: AbortSignal, log: (message: string) => void) => {
  let loadingProcess = loadingProcessMap.get(issueId);
  if (!loadingProcess) {
    const abortController = new AbortController();
    loadingProcess = { mergedAbortController: abortController, signals: [] };
    loadingProcessMap.set(issueId, loadingProcess);
  }
  loadingProcess.signals.push(abortSignal);
  abortSignal.addEventListener('abort', () => {
    log('abort signal registered');
    const currentLoadingProcess = loadingProcessMap.get(issueId);
    if (!currentLoadingProcess) {
      return;
    }
    currentLoadingProcess.signals = currentLoadingProcess.signals.filter(a => a !== abortSignal);
    if (currentLoadingProcess.signals.length === 0) {
      log('all signals aborted, cancel loading');
      currentLoadingProcess.mergedAbortController.abort();
    }
  });
  return loadingProcess;
};

const finishLoadingProcess = (issueId: IssueId) => {
  loadingProcessMap.delete(issueId);
};

const innerLoadSubtasksForIssue = createAction({
  name: 'loadSubtasksForIssue',
  async handler(issueId: string, abortSignal: AbortSignal) {
    const log = this.di.inject(loggerToken).getPrefixedLog(`innerLoadSubtasksForIssue ${issueId}`);
    const issueSubTasks = useJiraSubtasksStore.getState().data[issueId];
    if (issueSubTasks?.state === 'loaded') {
      log('skip because loaded');
      return;
    }

    const abortConfig = registerAbortSignal(issueId, abortSignal, log);

    if (issueSubTasks?.state === 'loading') {
      log('skip because loading');
      return;
    }

    log('start load issue');
    useJiraSubtasksStore.getState().actions.startLoadingSubtasks(issueId);
    await loadIssue(issueId, abortConfig.mergedAbortController.signal);

    log('start load subtasks');
    const result = await this.di
      .inject(JiraServiceToken)
      .fetchSubtasks(issueId, abortConfig.mergedAbortController.signal);

    finishLoadingProcess(issueId);
    if (result.err) {
      log(`error while loading subtasks ${result.val.message}`);
      useJiraSubtasksStore.getState().actions.removeSubtasks(issueId);
      return;
    }
    log('finished loading subtasks');

    useJiraSubtasksStore.getState().actions.addSubtasks(issueId, result.val);
  },
});

const loadExternalIssuesForIssue = createAction({
  name: 'loadExternalIssuesForIssue',
  async handler(issueKey: string, abortSignal: AbortSignal) {
    const logger = this.di.inject(loggerToken);
    const { actions } = useJiraExternalIssuesStore.getState();
    const log = logger.getPrefixedLog(`loadExternalIssuesForIssue: ${issueKey}`);

    const issueExternalIssues = useJiraExternalIssuesStore.getState().data[issueKey];
    if (issueExternalIssues?.state === 'loaded' || issueExternalIssues?.state === 'loading') {
      log('already loaded - skip', 'info');
      return;
    }

    actions.startLoadingExternalIssues(issueKey);

    const jiraService = this.di.inject(JiraServiceToken);
    let issueData = useJiraIssuesStore.getState().issues.find(i => i.data.key === issueKey);
    if (!issueData) {
      log('no issue data, start loading issue', 'info');
      await loadIssue(issueKey, abortSignal);
      issueData = useJiraIssuesStore.getState().issues.find(i => i.data.key === issueKey);
    }

    if (!issueData) {
      log('loaded issue but no data after loading finished', 'warn');
      actions.addExternalIssues(issueKey, []);
      return;
    }

    const settings = useSubTaskProgressBoardPropertyStore.getState().data;

    if (!settings.countEpicExternalLinks && issueData.data.issueType === 'Epic') {
      log('skip epic');
      actions.addExternalIssues(issueKey, []);
      return;
    }

    if (!settings.countIssuesExternalLinks && issueData.data.issueType === 'Task') {
      log('skip task');
      actions.addExternalIssues(issueKey, []);
      return;
    }

    if (!settings.countSubtasksExternalLinks && issueData.data.issueType === 'Sub-task') {
      log('skip sub-task');
      actions.addExternalIssues(issueKey, []);
      return;
    }

    log('start loading external issues');
    const result = await jiraService.getExternalIssues(issueKey, abortSignal);

    if (result.err) {
      log(`failed to load external issues ${result.val.message}`, 'error');
      actions.removeExternalIssues(issueKey);
      return;
    }

    actions.addExternalIssues(issueKey, result.val);
  },
});

export const loadSubtasksForIssue = createAction({
  name: 'loadSubtasksForIssue',
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
