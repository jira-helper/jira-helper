import { create } from 'zustand';
import { produce } from 'immer';

import { Subtasks } from '../../jiraService';
import { State } from './types';

export const useJiraSubtasksStore = create<State>(set => ({
  data: {},
  actions: {
    addSubtasks: (issueId: string, subtasks: Subtasks) => {
      return set(
        produce((state: State) => {
          if (!state.data) return;
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
          if (!state.data) return;
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
          if (!state.data) return;
          delete state.data[issueId];
        })
      );
    },
  },
}));
