import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { useJiraSubtasksStore } from './jiraSubtasks';
import { JiraServiceToken } from '../jiraService';
import { loadIssue } from '../jiraIssues/actions/loadIssue';

type IssueId = string;
type LoadingProcess = { mergedAbortController: AbortController; signals: AbortSignal[] };
const loadingProcessMap = new Map<IssueId, LoadingProcess>();
const finishLoadingProcess = (issueId: IssueId) => {
  loadingProcessMap.delete(issueId);
};
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

export const loadSubtasksForIssue = createAction({
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
