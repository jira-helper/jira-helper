import { AvailableColorSchemas } from './colorSchemas';

export type IgnoredStatus = 'ignored';
export type ActiveStatuses = 'todo' | 'inProgress' | 'almostDone' | 'done' | 'blocked' | 'unmapped';
export type Status = IgnoredStatus | ActiveStatuses;
export type SubTasksProgress = {
  [key in ActiveStatuses]: number;
};

/**
 * used to map statuses to colors
 */
export type ColorScheme = {
  [key in ActiveStatuses]: string;
};

type StatusId = number;

export type GroupFields = 'project' | 'assignee' | 'reporter' | 'priority' | 'creator' | 'issueType';
export type BoardProperty = {
  enabled?: boolean;
  columnsToTrack?: string[];
  groupingField?: GroupFields;
  statusMapping?: Record<string, Status>;
  newStatusMapping?: Record<StatusId, { progressStatus: Status; name: string }>;
  useCustomColorScheme?: boolean;
  ignoredGroups?: string[];
  selectedColorScheme?: AvailableColorSchemas;
  countEpicIssues?: boolean;
  countEpicLinkedIssues?: boolean;
  countIssuesSubtasks?: boolean;
  countIssuesLinkedIssues?: boolean;
  countSubtasksLinkedIssues?: boolean;
  ignoredStatuses?: number[];
  flagsAsBlocked?: boolean;
  blockedByLinksAsBlocked?: boolean;
  countIssuesExternalLinks?: boolean;
  countSubtasksExternalLinks?: boolean;
  countEpicExternalLinks?: boolean;
  subtasksProgressDisplayMode?: 'splitLines' | 'singleLine';
};

export type CountType =
  | 'countEpicIssues'
  | 'countEpicLinkedIssues'
  | 'countEpicExternalLinks'
  | 'countIssuesSubtasks'
  | 'countIssuesLinkedIssues'
  | 'countIssuesExternalLinks'
  | 'countSubtasksLinkedIssues'
  | 'countSubtasksExternalLinks';
