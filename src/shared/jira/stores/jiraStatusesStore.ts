import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { JiraStatus } from 'src/infrastructure/jira/types';

interface JiraStatusesState {
  statuses: JiraStatus[];
  isLoading: boolean;
  error: Error | null;
  setStatuses: (statuses: JiraStatus[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useJiraStatusesStore = create<JiraStatusesState>()(
  immer(set => ({
    statuses: [],
    isLoading: false,
    error: null,
    setStatuses: statuses =>
      set(state => {
        state.statuses = statuses;
      }),
    setLoading: isLoading =>
      set(state => {
        state.isLoading = isLoading;
      }),
    setError: error =>
      set(state => {
        state.error = error;
      }),
  }))
);
