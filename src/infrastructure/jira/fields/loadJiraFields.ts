import { globalContainer } from 'dioma';
import { JiraServiceToken } from '../jiraService';
import { useJiraFieldsStore } from './jiraFieldsStore';
import { JiraField } from '../types';

export const loadJiraFields = async (abortSignal: AbortSignal) => {
  const jiraService = globalContainer.inject(JiraServiceToken);
  const store = useJiraFieldsStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const result = await jiraService.getProjectFields(abortSignal);
    if (result.err) {
      store.setError(result.val);
      return;
    }

    store.setFields(result.val);
  } catch (error) {
    // if abort signal is aborted, don't set error
    if (abortSignal.aborted) {
      return;
    }
    store.setError(error instanceof Error ? error : new Error('Unknown error occurred'));
  } finally {
    store.setLoading(false);
  }
};

export const getEpicLinkFieldId = (fields: JiraField[]) => {
  return fields.find(field => field.name === 'Epic Link')?.id;
};
