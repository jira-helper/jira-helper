import type { IssueLinkTypeSelection } from 'src/features/sub-tasks-progress/types';

export type { IssueLinkTypeSelection };

/**
 * How a Gantt date endpoint is resolved: from a Jira date field or from status transition timestamps in the changelog.
 */
export type DateMappingSource = 'dateField' | 'statusTransition';

/**
 * Mapping configuration for one bar endpoint (start or end): either a field id or a status name in the changelog.
 *
 * @example Date field mapping
 * { source: 'dateField', fieldId: 'created' }
 *
 * @example Status transition mapping
 * { source: 'statusTransition', statusName: 'Done' }
 */
export type DateMapping = {
  source: DateMappingSource;
  /** Jira field id when `source` is `dateField`. */
  fieldId?: string;
  /** Status name to anchor on when `source` is `statusTransition`. */
  statusName?: string;
};

/**
 * Optional filter that excludes issues from the Gantt scope (by field value or arbitrary JQL).
 */
export type ExclusionFilter = {
  mode: 'field' | 'jql';
  fieldId?: string;
  value?: string;
  jql?: string;
};

/**
 * Rule that assigns a bar fill color when the selector matches (field mode evaluated when computing bars; JQL reserved).
 */
export type ColorRule = {
  selector: { mode: 'field' | 'jql'; fieldId?: string; value?: string; jql?: string };
  color: string;
};

/**
 * Resolved settings for one Gantt scope (global, project, or project+issue type), including inclusion of related issues (FR-5).
 */
export type GanttScopeSettings = {
  startMapping: DateMapping;
  endMapping: DateMapping;
  /** Rules for custom bar colors (first match wins). */
  colorRules: ColorRule[];
  /** Jira field IDs to show in hover tooltip. */
  tooltipFieldIds: string[];
  /** @deprecated Use `exclusionFilters` instead. Kept for backward compatibility during migration. */
  exclusionFilter?: ExclusionFilter | null;
  /** Filters to exclude issues from the chart (OR logic — any match excludes). */
  exclusionFilters: ExclusionFilter[];
  /** Hide issues with statusCategory = done. */
  hideCompletedTasks: boolean;
  /** Include subtasks of the root issue in the chart. */
  includeSubtasks: boolean;
  /** Include epic children when applicable. */
  includeEpicChildren: boolean;
  /** Include issues linked via issue links. */
  includeIssueLinks: boolean;
  /**
   * When `includeIssueLinks` is true, restricts which link types and directions are followed.
   * Empty array typically means “no restriction” (all configured link types); UI may interpret explicitly.
   */
  issueLinkTypesToInclude: IssueLinkTypeSelection[];
};

/**
 * Persisted map of scope key → settings (e.g. localStorage payload).
 */
export type GanttSettingsStorage = Record<string, GanttScopeSettings>;

/**
 * Identifies a settings tier: global default, project default, or project + issue type.
 */
export type SettingsScope = {
  level: 'global' | 'project' | 'projectIssueType';
  projectKey?: string;
  issueType?: string;
};

/** Serialized key for a scope in storage (e.g. `_global`, `PROJ`, `PROJ:Story`). */
export type ScopeKey = string;

/** Granularity for time axis / zoom presets. */
export type TimeInterval = 'hours' | 'days' | 'weeks' | 'months';

/** Normalized Jira-style status category for coloring and sections. */
export type BarStatusCategory = 'blocked' | 'todo' | 'inProgress' | 'done';

/**
 * One contiguous segment of time within a bar where the issue was in a given status.
 */
export type BarStatusSection = {
  statusName: string;
  category: BarStatusCategory;
  startDate: Date;
  endDate: Date;
};

/**
 * Single changelog-derived status transition with categories for timeline reconstruction.
 */
export type StatusTransition = {
  timestamp: Date;
  fromStatus: string;
  toStatus: string;
  fromCategory: string;
  toCategory: string;
};

/** Why an issue cannot be placed on the timeline. */
export type MissingDateReason = 'noStartDate' | 'noEndDate' | 'noStartAndEndDate' | 'excluded';

/**
 * Issue that appears in the “missing dates” list instead of as a bar.
 */
export type MissingDateIssue = {
  issueKey: string;
  summary: string;
  reason: MissingDateReason;
};

/**
 * One row in the Gantt: computed dates, label, tooltip payload, and status timeline sections.
 */
export type GanttBar = {
  issueKey: string;
  issueId: string;
  label: string;
  startDate: Date;
  endDate: Date;
  /** True when the bar has a start but no fixed end (e.g. still open). */
  isOpenEnded: boolean;
  statusSections: BarStatusSection[];
  tooltipFields: Record<string, string>;
  statusCategory: BarStatusCategory;
  /** Fill color from scope color rules when matched. */
  barColor?: string;
};

/**
 * Output of bar computation: drawable bars plus issues that could not be dated.
 */
export type ComputeBarsResult = {
  bars: GanttBar[];
  missingDateIssues: MissingDateIssue[];
};

/** Lifecycle of async load for Gantt data. */
export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';
