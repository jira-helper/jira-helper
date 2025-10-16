import { IssueLink, AdditionalCardElementsBoardProperty } from '../types';

export type State = {
  data: Required<AdditionalCardElementsBoardProperty>;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (data: AdditionalCardElementsBoardProperty) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    setColumns: (columns: { name: string; enabled: boolean }[]) => void;
    setIssueLinks: (issueLinks: IssueLink[]) => void;
    clearIssueLinks: () => void;
  };
};
