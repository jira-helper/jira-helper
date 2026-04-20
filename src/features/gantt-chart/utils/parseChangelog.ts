import { mapStatusCategoryColorToProgressStatus } from 'src/features/sub-tasks-progress/colorSchemas';
import type { ExternalIssueMapped } from 'src/shared/jira/types';
import type { StatusTransition } from '../types';

/** Optional status category metadata sometimes present on changelog items (expanded API / future shapes). */
export type JiraChangelogStatusCategoryMeta = {
  key?: string;
  colorName?: string;
};

/** One changelog item; `field === 'status'` entries are turned into transitions. */
export type JiraChangelogItemInput = {
  field: string;
  fromString?: string | null;
  toString?: string | null;
  from?: string | null;
  to?: string | null;
  fromStatusCategory?: JiraChangelogStatusCategoryMeta;
  toStatusCategory?: JiraChangelogStatusCategoryMeta;
};

/** Minimal changelog shape: any object with optional `histories`. */
export type JiraChangelogInput = {
  histories?: Array<{
    created?: string;
    items?: JiraChangelogItemInput[];
  }>;
};

function mapStatusCategoryKeyToProgress(key: string | undefined): string {
  if (key === 'new') return 'todo';
  if (key === 'indeterminate') return 'inProgress';
  if (key === 'done') return 'done';
  return '';
}

function resolveTransitionSideCategory(meta: JiraChangelogStatusCategoryMeta | undefined): string {
  if (!meta) return '';

  const colorName = meta.colorName as ExternalIssueMapped['statusColor'] | undefined;
  if (colorName) {
    const fromColor = mapStatusCategoryColorToProgressStatus(colorName);
    if (fromColor) return fromColor;
  }

  return mapStatusCategoryKeyToProgress(meta.key);
}

/**
 * Extract status transitions from a Jira issue changelog (`expandedChangelog` / `changelog`).
 * Keeps only items where `field === 'status'`, drops histories with invalid `created`, sorts oldest first.
 */
export function parseChangelog(changelog: JiraChangelogInput | null | undefined): StatusTransition[] {
  if (!changelog?.histories?.length) return [];

  const transitions: StatusTransition[] = [];

  for (const history of changelog.histories) {
    const timestamp = history.created ? new Date(history.created) : null;
    if (!timestamp || Number.isNaN(timestamp.getTime())) continue;

    for (const item of history.items ?? []) {
      if (item.field !== 'status') continue;

      transitions.push({
        timestamp,
        fromStatus: item.fromString ?? '',
        toStatus: item.toString ?? '',
        fromCategory: resolveTransitionSideCategory(item.fromStatusCategory),
        toCategory: resolveTransitionSideCategory(item.toStatusCategory),
      });
    }
  }

  transitions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return transitions;
}
