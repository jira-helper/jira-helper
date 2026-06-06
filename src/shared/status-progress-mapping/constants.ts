import type { ProgressBucket } from './types';

/** Configurable bucket: backlog / not started. */
export const PROGRESS_BUCKET_TODO: ProgressBucket = 'todo';

/** Configurable bucket: active work. */
export const PROGRESS_BUCKET_IN_PROGRESS: ProgressBucket = 'inProgress';

/** Configurable bucket: completed. */
export const PROGRESS_BUCKET_DONE: ProgressBucket = 'done';

/**
 * All user-selectable progress buckets in fixed UI order.
 * Only `todo`, `inProgress`, `done` — no `blocked` or custom segments.
 */
export const PROGRESS_BUCKET_VALUES: readonly ProgressBucket[] = [
  PROGRESS_BUCKET_TODO,
  PROGRESS_BUCKET_IN_PROGRESS,
  PROGRESS_BUCKET_DONE,
];

/** Display labels for bucket selects (Ant Design `Select`, etc.). */
export const PROGRESS_BUCKET_LABELS: Record<ProgressBucket, string> = {
  [PROGRESS_BUCKET_TODO]: 'To Do',
  [PROGRESS_BUCKET_IN_PROGRESS]: 'In Progress',
  [PROGRESS_BUCKET_DONE]: 'Done',
};

/**
 * Options for progress bucket dropdowns: value + label pairs.
 */
export const PROGRESS_BUCKET_OPTIONS: readonly {
  value: ProgressBucket;
  label: string;
}[] = PROGRESS_BUCKET_VALUES.map(value => ({
  value,
  label: PROGRESS_BUCKET_LABELS[value],
}));
