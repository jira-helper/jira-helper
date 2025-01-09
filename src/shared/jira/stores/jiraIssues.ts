import { create } from 'zustand';
import { JiraIssueMapped } from '../types';

export const useJiraIssuesStore = create<{
  issues: { data: JiraIssueMapped; loadedTime: number }[];
  loading: boolean;
}>(set => ({
  issues: [],
  loading: false,
  addIssue: (issue: JiraIssueMapped, loadedTime: number) =>
    set(state => ({ issues: [...state.issues, { data: issue, loadedTime }] })),
  setIssues: (issues: { data: JiraIssueMapped; loadedTime: number }[]) => set({ issues }),
  removeIssue: (issue: JiraIssueMapped) => set(state => ({ issues: state.issues.filter(i => i.data.id !== issue.id) })),
  setLoading: (loading: boolean) => set({ loading }),
}));
