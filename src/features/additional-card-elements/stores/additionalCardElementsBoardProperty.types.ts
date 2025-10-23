import { IssueLink, AdditionalCardElementsBoardProperty } from '../types';

export type State = {
  data: Required<AdditionalCardElementsBoardProperty>;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (data: AdditionalCardElementsBoardProperty) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    setEnabled: (enabled: boolean) => void;
    setColumns: (columns: { name: string; enabled: boolean }[]) => void;
    setIssueLinks: (issueLinks: IssueLink[]) => void;
    addIssueLink: (issueLink: IssueLink) => void;
    updateIssueLink: (index: number, issueLink: IssueLink) => void;
    removeIssueLink: (index: number) => void;
    clearIssueLinks: () => void;
  };
};
