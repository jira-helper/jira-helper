import type { IssueLinkTypeSelection } from 'src/features/sub-tasks-progress/types';
import type { StatusProgressMapping } from 'src/shared/status-progress-mapping/types';

export type { IssueLinkTypeSelection };

/**
 * How a Gantt date endpoint is resolved: from a Jira date field or from status transition timestamps in the changelog.
 */
export type DateMappingSource = 'dateField' | 'statusTransition';

/**
 * Mapping configuration for one bar endpoint (start or end): either a field id or a status transition id.
 *
 * @example Date field mapping
 * { source: 'dateField', fieldId: 'created' }
 *
 * @example Status transition mapping
 * { source: 'statusTransition', statusId: '10002', statusName: 'Done' }
 */
export type DateMapping = {
  source: DateMappingSource;
  /** Jira field id when `source` is `dateField`. */
  fieldId?: string;
  /** Stable Jira status id from changelog `from` / `to` when `source` is `statusTransition`. */
  statusId?: string;
  /** Display/debug fallback for legacy rows. Runtime matching must not use this field. */
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
  /** Human-readable label shown in the legend. Legacy unnamed rules fall back to selector text. */
  name?: string;
  selector: { mode: 'field' | 'jql'; fieldId?: string; value?: string; jql?: string };
  color: string;
};

/**
 * User-defined quick filter preset displayed as a toggleable chip on the Gantt toolbar.
 * Active state is session-only (kept in `GanttQuickFiltersModel`); the preset itself cascades like other scope settings.
 *
 * `id` is a stable identifier (UUID for custom filters, `builtin:<key>` for built-ins).
 * Multiple active quick filters combine via AND, matching how Jira boards combine quick filters.
 */
export type QuickFilter = {
  id: string;
  name: string;
  selector: { mode: 'field' | 'jql'; fieldId?: string; value?: string; jql?: string };
};

/**
 * Resolved settings for one Gantt scope (global, project, or project+issue type), including inclusion of related issues (FR-5).
 */
export type GanttScopeSettings = {
  /**
   * Ordered fallback list for resolving a bar's start date.
   * The first mapping that yields a valid Date for an issue wins.
   * Must always contain at least one entry (UI/migration enforce this).
   */
  startMappings: DateMapping[];
  /**
   * Ordered fallback list for resolving a bar's end date.
   * The first mapping that yields a valid Date for an issue wins.
   * Must always contain at least one entry.
   */
  endMappings: DateMapping[];
  /** Rules for custom bar colors (first match wins). */
  colorRules: ColorRule[];
  /** Jira field IDs to show in hover tooltip. */
  tooltipFieldIds: string[];
  /** @deprecated Use `exclusionFilters` instead. Kept for backward compatibility during migration. */
  exclusionFilter?: ExclusionFilter | null;
  /** Filters to exclude issues from the chart (OR logic — any match excludes). */
  exclusionFilters: ExclusionFilter[];
  /**
   * User-defined quick filter presets surfaced as chips on the toolbar.
   * Active toggle state is session-only (see `GanttQuickFiltersModel`).
   *
   * Optional in the type to avoid breaking existing test/storage payloads;
   * resolved settings always normalize to an array via the migration in `GanttSettingsModel`.
   */
  quickFilters?: QuickFilter[];
  /** Optional Jira status id -> progress bucket overrides for Gantt progress/status calculation. */
  statusProgressMapping?: StatusProgressMapping;
  /** @deprecated Replaced by built-in quick filter `builtin:hideCompleted`. Kept on type for migration only. */
  hideCompletedTasks?: boolean;
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
 *
 * Status ids come from Jira changelog `from` / `to`; display labels from `fromString` / `toString`.
 * `fromStatus` / `toStatus` mirror the display names for legacy call sites (e.g. date mapping by name).
 */
export type StatusTransition = {
  timestamp: Date;
  /** Display name before transition (`fromString`). */
  fromStatus: string;
  /** Display name after transition (`toString`). */
  toStatus: string;
  /** Jira status id before transition (`from`). */
  fromStatusId: string;
  /** Jira status id after transition (`to`). */
  toStatusId: string;
  /** Same as `fromStatus`; explicit label for UI / debug. */
  fromStatusName: string;
  /** Same as `toStatus`; explicit label for UI / debug. */
  toStatusName: string;
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
