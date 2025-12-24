export type IssueLinkTypeSelection = {
  id: string;
  direction: 'inward' | 'outward';
};

export type IssueSelector = {
  mode: 'field' | 'jql';
  fieldId?: string;
  value?: string;
  jql?: string;
};

export type IssueLink = {
  name: string; // Human-readable name
  linkType: IssueLinkTypeSelection;
  trackAllTasks?: boolean; // If true, analyze links for all tasks, otherwise use issueSelector
  issueSelector?: IssueSelector; // Filter for tasks to analyze links for
  trackAllLinkedTasks?: boolean; // If true, show all linked tasks, otherwise use linkedIssueSelector
  linkedIssueSelector?: IssueSelector; // Filter for linked tasks to display
  color?: string;
  multilineSummary?: boolean;
};

export type ColumnThresholds = {
  warningThreshold?: number;
  dangerThreshold?: number;
};

export type PerColumnThresholds = Record<string, ColumnThresholds>;

export type DaysInColumnSettings = {
  enabled: boolean;
  warningThreshold?: number;
  dangerThreshold?: number;
  usePerColumnThresholds?: boolean;
  perColumnThresholds?: PerColumnThresholds;
};

export type DaysToDeadlineDisplayMode = 'always' | 'lessThanOrOverdue' | 'overdueOnly';

export type DaysToDeadlineSettings = {
  enabled: boolean;
  fieldId?: string;
  displayMode?: DaysToDeadlineDisplayMode; // По умолчанию 'always'
  displayThreshold?: number; // Для режима 'lessThanOrOverdue'
  warningThreshold?: number;
};

export type AdditionalCardElementsBoardProperty = {
  enabled?: boolean;
  columnsToTrack?: string[];
  showInBacklog?: boolean;
  issueLinks?: IssueLink[];
  daysInColumn?: DaysInColumnSettings;
  daysToDeadline?: DaysToDeadlineSettings;
};
