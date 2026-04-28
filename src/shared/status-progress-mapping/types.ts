/**
 * Shared domain contract for configuring `status id -> progress bucket`.
 * Independent of Gantt / sub-tasks storage specifics.
 */

/**
 * Progress bucket configurable by users.
 *
 * This intentionally excludes `blocked`: blocked remains a runtime override
 * derived from flags/link rules in sub-tasks progress, not a persisted status mapping bucket.
 */
export type ProgressBucket = 'todo' | 'inProgress' | 'done';

/**
 * One persisted status mapping row (storage shape).
 *
 * `statusId` is the only stable matching key for runtime resolution.
 * `statusName` is fallback/debug metadata only — do not use it for matching.
 *
 * The source of truth for the current UI label is `JiraService.getStatuses()` /
 * live `JiraStatus[]`. Use `statusName` only when statuses are not loaded yet or the
 * saved id is missing from the returned list.
 */
export type StatusProgressMappingEntry = {
  /**
   * Jira status id from `JiraStatus.id` or changelog item `from` / `to`.
   * This is the sole canonical key for mapping and calculations.
   */
  statusId: string;
  /**
   * Fallback/debug label captured at save time; can become stale after Jira rename or locale change.
   * Not used for runtime matching.
   */
  statusName: string;
  /** Normalized progress bucket used by calculations. */
  bucket: ProgressBucket;
};

/**
 * Persisted status id → progress bucket mapping.
 *
 * Keys duplicate `entry.statusId` for cheap lookup and JSON readability.
 */
export type StatusProgressMapping = Record<string, StatusProgressMappingEntry>;

/**
 * One editable row in status progress mapping UI (draft / section state).
 *
 * `statusId` is the only stable matching key. `statusName` is fallback/debug metadata;
 * the displayed label should be resolved from live `JiraStatus[]` by `statusId` when possible.
 */
export type StatusProgressMappingRow = {
  statusId: string;
  /** Fallback/debug label from persisted mapping; current UI label is resolved from `statuses` by `statusId`. */
  statusName: string;
  bucket: ProgressBucket;
};
