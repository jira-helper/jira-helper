import { CustomGroup } from './BoardSettings/GroupingSettings/CustomGroups/types';
import { AvailableColorSchemas } from './colorSchemas';
import type { StatusProgressMapping } from 'src/shared/status-progress-mapping/types';

export type ActiveStatuses = 'todo' | 'inProgress' | 'done' | 'blocked';
export type Status = ActiveStatuses;
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
export type IssueLinkTypeSelection = {
  id: string;
  direction: 'inward' | 'outward';
};

export type BoardProperty = {
  enabled?: boolean;
  columnsToTrack?: string[];
  groupingField?: GroupFields;
  /**
   * Optional Jira status id -> progress bucket mapping for sub-tasks progress.
   * Missing block keeps the default Jira statusCategory behavior.
   *
   * The configurable buckets intentionally exclude `blocked`: blocked remains
   * a runtime override derived from flags/link settings, not a status mapping value.
   */
  statusProgressMapping?: StatusProgressMapping;
  /** Legacy readable compatibility mapping; new status progress mapping writes must not use it. */
  statusMapping?: Record<string, Status>;
  /** Legacy readable compatibility mapping; new status progress mapping writes must not use it. */
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
  customGroups?: CustomGroup[];
  enableAllTasksTracking?: boolean;
  enableGroupByField?: boolean;
  showGroupsByFieldAsCounters?: boolean;
  groupByFieldPendingColor?: string;
  groupByFieldDoneColor?: string;
  groupByFieldHideIfCompleted?: boolean;
  groupByFieldShowOnlyIncomplete?: boolean;
  /**
   * If countEpicLinkedIssues or countIssuesLinkedIssues is enabled, this stores which link types/directions to count.
   * If empty or undefined, all are counted.
   */
  issueLinkTypesToCount?: IssueLinkTypeSelection[];
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
