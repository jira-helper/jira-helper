import { create } from 'zustand';
import { produce } from 'immer';

import { State } from './types';
import { ExternalIssueMapped } from '../../types';

export const useJiraExternalIssuesStore = create<State>(set => ({
  data: {},
  actions: {
    addExternalIssues: (issueKey: string, externalIssues: ExternalIssueMapped[]) => {
      return set(
        produce((state: State) => {
          if (!state.data) return;
          state.data[issueKey] = {
            externalIssues,
            state: 'loaded',
          };
        })
      );
    },
    startLoadingExternalIssues: (issueKey: string) => {
      return set(
        produce((state: State) => {
          if (!state.data) return;
          state.data[issueKey] = {
            externalIssues: [],
            state: 'loading',
          };
        })
      );
    },
    removeExternalIssues: (issueKey: string) => {
      return set(
        produce((state: State) => {
          if (!state.data) return;
          delete state.data[issueKey];
        })
      );
    },
  },
}));
