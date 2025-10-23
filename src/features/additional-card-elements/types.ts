export type IssueLinkTypeSelection = {
  id: string;
  direction: 'inward' | 'outward';
};

export type IssueLink = {
  name: string; // Human-readable name
  linkType: IssueLinkTypeSelection;
  issueSelector?: {
    mode: 'field' | 'jql';
    fieldId?: string;
    value?: string;
    jql?: string;
  };
  color?: string;
};

export type AdditionalCardElementsBoardProperty = {
  enabled?: boolean;
  columnsToTrack?: string[];
  issueLinks?: IssueLink[];
};
