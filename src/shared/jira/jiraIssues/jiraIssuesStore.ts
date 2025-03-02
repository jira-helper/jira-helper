import { create } from 'zustand';
import { produce } from 'immer';
import { JiraIssueMapped } from '../types';

type State = {
  issues: { data: JiraIssueMapped }[];
  actions: {
    addIssue: (issue: JiraIssueMapped) => void;
    removeIssue: (issueKey: string) => void;
  };
};

export const useJiraIssuesStore = create<State>(set => ({
  issues: [],
  actions: {
    addIssue: (issue: JiraIssueMapped) =>
      set(
        produce((state: State) => {
          state.issues.push({ data: issue });
        })
      ),

    removeIssue: (issueKey: string) =>
      set(
        produce((state: State) => {
          state.issues = state.issues.filter(i => i.data.key !== issueKey);
        })
      ),
  },
}));
