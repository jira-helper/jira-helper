import {
  IssueLink,
  AdditionalCardElementsBoardProperty,
  DaysInColumnSettings,
  DaysToDeadlineSettings,
  IssueConditionCheck,
} from '../types';

export type RequiredBoardProperty = {
  enabled: boolean;
  columnsToTrack: string[];
  showInBacklog: boolean;
  clickableEpicLinks: boolean;
  clickableIssueLinks: boolean;
  issueLinks: IssueLink[];
  daysInColumn: DaysInColumnSettings;
  daysToDeadline: DaysToDeadlineSettings;
  issueConditionChecks: IssueConditionCheck[];
};

export type State = {
  data: RequiredBoardProperty;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (data: AdditionalCardElementsBoardProperty) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    setEnabled: (enabled: boolean) => void;
    setColumns: (columns: { name: string; enabled: boolean }[]) => void;
    setShowInBacklog: (showInBacklog: boolean) => void;
    setClickableEpicLinks: (clickableEpicLinks: boolean) => void;
    setClickableIssueLinks: (clickableIssueLinks: boolean) => void;
    setIssueLinks: (issueLinks: IssueLink[]) => void;
    addIssueLink: (issueLink: IssueLink) => void;
    updateIssueLink: (index: number, issueLink: IssueLink) => void;
    removeIssueLink: (index: number) => void;
    clearIssueLinks: () => void;
    setDaysInColumn: (settings: Partial<DaysInColumnSettings>) => void;
    setDaysToDeadline: (settings: Partial<DaysToDeadlineSettings>) => void;
    // Issue Condition Checks
    setIssueConditionChecks: (checks: IssueConditionCheck[]) => void;
    addIssueConditionCheck: (check: IssueConditionCheck) => void;
    updateIssueConditionCheck: (id: string, check: Partial<IssueConditionCheck>) => void;
    removeIssueConditionCheck: (id: string) => void;
  };
};
