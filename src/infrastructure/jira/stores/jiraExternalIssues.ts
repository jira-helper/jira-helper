import { create } from 'zustand';
import { produce } from 'immer';

import { ExternalIssueMapped } from '../types';

type State = {
  data: {
    [issueKey: string]:
      | {
          externalIssues: ExternalIssueMapped[];
          state: 'loading' | 'loaded' | 'error';
        }
      | undefined;
  };
  actions: {
    addExternalIssues: (issueKey: string, externalIssues: ExternalIssueMapped[]) => void;
    removeExternalIssues: (issueKey: string) => void;
    startLoadingExternalIssues: (issueKey: string) => void;
  };
};

export const useJiraExternalIssuesStore = create<State>(set => ({
  data: {},
  actions: {
    addExternalIssues: (issueKey: string, externalIssues: ExternalIssueMapped[]) => {
      return set(
        produce((state: State) => {
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
          delete state.data[issueKey];
        })
      );
    },
  },
}));
