import { create } from 'zustand';
import { JiraIssueMapped } from '../types';
import { Subtasks } from '../jiraService';

export const useJiraSubtasksStore = create<{
  data: {
    issueId: string;
    data: {
      subtasks: JiraIssueMapped[];
      externalLinks: JiraIssueMapped[];
    };
    loadedTime: number;
  }[];
  loading: boolean;
}>(set => ({
  data: [],
  loading: false,
  addSubtasks: (issueId: string, subtasks: Subtasks) => {
    return set(state => ({ data: [...state.data, { issueId, data: subtasks, loadedTime: Date.now() }] }));
  },
  removeSubtasks: (issueId: string) => {
    return set(state => ({ data: state.data.filter(i => i.issueId !== issueId) }));
  },
}));
