import { create } from 'zustand';
import { produce } from 'immer';

import { Subtasks } from '../jiraService';

import { JiraIssueMapped } from '../types';

type State = {
  data: {
    [issueId: string]:
      | {
          subtasks: JiraIssueMapped[];
          externalLinks: JiraIssueMapped[];
          state: 'loading' | 'loaded' | 'error';
        }
      | undefined;
  };
  actions: {
    addSubtasks: (issueId: string, subtasks: Subtasks) => void;
    removeSubtasks: (issueId: string) => void;
    startLoadingSubtasks: (issueId: string) => void;
  };
};

export const useJiraSubtasksStore = create<State>(set => ({
  data: {},
  actions: {
    addSubtasks: (issueId: string, subtasks: Subtasks) => {
      return set(
        produce((state: State) => {
          state.data[issueId] = {
            subtasks: subtasks.subtasks,
            externalLinks: subtasks.externalLinks,
            state: 'loaded',
          };
        })
      );
    },
    startLoadingSubtasks: (issueId: string) => {
      return set(
        produce((state: State) => {
          state.data[issueId] = {
            subtasks: [],
            externalLinks: [],
            state: 'loading',
          };
        })
      );
    },
    removeSubtasks: (issueId: string) => {
      return set(
        produce((state: State) => {
          delete state.data[issueId];
        })
      );
    },
  },
}));
