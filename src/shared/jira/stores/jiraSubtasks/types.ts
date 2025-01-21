import { Subtasks } from '../../jiraService';
import { JiraIssueMapped } from '../../types';

export type State = {
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
