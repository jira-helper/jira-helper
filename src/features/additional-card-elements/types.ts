export type IssueLinkTypeSelection = {
  id: string;
  direction: 'inward' | 'outward';
};

export type IssueLink = {
  linkType: IssueLinkTypeSelection;
  jql: string;
  color?: string;
};

export type AdditionalCardElementsBoardProperty = {
  columnsToTrack?: string[];
  issueLinks?: IssueLink[];
};
