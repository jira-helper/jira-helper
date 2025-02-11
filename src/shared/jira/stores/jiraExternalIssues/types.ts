import { ExternalIssueMapped } from '../../types';

export type State = {
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
