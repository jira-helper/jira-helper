import { JiraIssueMapped } from '../../types';

export type State = {
  issues: { data: JiraIssueMapped }[];
  actions: {
    addIssue: (issue: JiraIssueMapped) => void;
    removeIssue: (issueKey: string) => void;
  };
};
