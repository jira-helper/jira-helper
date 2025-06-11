import { globalContainer } from 'dioma';
import { JiraServiceToken } from '../jiraService';
import { useJiraIssueLinkTypesStore } from './jiraIssueLinkTypesStore';

export const loadJiraIssueLinkTypes = async (abortSignal: AbortSignal) => {
  const jiraService = globalContainer.inject(JiraServiceToken);
  const store = useJiraIssueLinkTypesStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const result = await jiraService.getIssueLinkTypes(abortSignal);
    if (result.err) {
      store.setError(result.val);
      return;
    }
    store.setLinkTypes(result.val);
  } catch (error) {
    if (abortSignal.aborted) {
      return;
    }
    store.setError(error instanceof Error ? error : new Error('Unknown error occurred'));
  } finally {
    store.setLoading(false);
  }
};
