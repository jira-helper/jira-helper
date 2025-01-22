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

export type GroupFields = 'project' | 'assignee' | 'reporter' | 'priority' | 'creator' | 'issueType';
export type BoardProperty = {
  columnsToTrack?: string[];
  groupingField?: GroupFields;
  statusMapping?: Record<string, Status>;
  selectedColorScheme?: AvailableColorSchemas;
  countSubtasksOfIssue?: boolean;
  countIssuesInEpic?: boolean;
  countLinkedIssues?: boolean;
};
