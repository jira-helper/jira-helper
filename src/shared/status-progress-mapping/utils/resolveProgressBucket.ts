import type { ProgressBucket, StatusProgressMapping } from '../types';

/**
 * Jira REST `status.statusCategory.key` values used when no custom row exists for `statusId`.
 */
export type JiraStatusCategoryKey = 'new' | 'indeterminate' | 'done';

/**
 * Resolves progress bucket for a Jira status.
 *
 * - Custom `StatusProgressMapping` wins only when an entry exists for the exact `statusId` (map key).
 * - `statusName` on entries is never read — matching is id-only.
 * - Without a matching row: `new` → `todo`, `indeterminate` → `inProgress`, `done` → `done`.
 * - Unknown category keys fall back to `done` (same default branch as legacy sub-tasks mapping).
 * - `blocked` is not handled here; callers apply blocked overrides separately.
 */
export function resolveProgressBucket(
  statusId: string,
  statusCategory: JiraStatusCategoryKey | string,
  mapping?: StatusProgressMapping | null
): ProgressBucket {
  const entry = mapping?.[statusId];
  if (entry !== undefined && entry.statusId === statusId) {
    return entry.bucket;
  }

  if (statusCategory === 'new') {
    return 'todo';
  }
  if (statusCategory === 'indeterminate') {
    return 'inProgress';
  }
  if (statusCategory === 'done') {
    return 'done';
  }

  return 'done';
}
