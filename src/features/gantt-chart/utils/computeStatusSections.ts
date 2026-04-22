import { mapStatusCategoryColorToProgressStatus } from 'src/features/sub-tasks-progress/colorSchemas';
import type { ExternalIssueMapped } from 'src/infrastructure/jira/types';
import type { BarStatusCategory, BarStatusSection, StatusTransition } from '../types';

/**
 * Maps Jira status category metadata key to progress-style category (same as `parseChangelog` / `mapStatusCategoryKeyToProgress`).
 */
function mapStatusCategoryKeyToProgress(key: string | undefined): string {
  if (key === 'new') return 'todo';
  if (key === 'indeterminate') return 'inProgress';
  if (key === 'done') return 'done';
  return '';
}

/**
 * Maps a changelog-style category string (from `StatusTransition.fromCategory` / `toCategory`) to `BarStatusCategory`.
 * Same resolution order as `parseChangelog` `resolveTransitionSideCategory`: color name → category key → literals → `todo`.
 */
export function mapCategoryStringToBarStatusCategory(raw: string): BarStatusCategory {
  const normalized = raw.trim();

  if (normalized === '') return 'todo';

  const fromColor = mapStatusCategoryColorToProgressStatus(normalized as ExternalIssueMapped['statusColor']);
  if (fromColor) return fromColor;

  const fromKey = mapStatusCategoryKeyToProgress(normalized);
  if (fromKey === 'todo' || fromKey === 'inProgress' || fromKey === 'done') {
    return fromKey;
  }

  if (normalized === 'blocked' || normalized === 'todo' || normalized === 'inProgress' || normalized === 'done') {
    return normalized;
  }

  return 'todo';
}

function compareTransitionTime(a: StatusTransition, b: StatusTransition): number {
  return a.timestamp.getTime() - b.timestamp.getTime();
}

function resolveCategoryWithFallback(
  rawCategory: string,
  statusName: string,
  categoryByStatusName?: ReadonlyMap<string, BarStatusCategory>
): BarStatusCategory {
  if (rawCategory.trim() !== '') {
    return mapCategoryStringToBarStatusCategory(rawCategory);
  }
  if (categoryByStatusName) {
    const fromMap = categoryByStatusName.get(statusName);
    if (fromMap) return fromMap;
  }
  return 'todo';
}

function resolveStateAtOrAfterTransition(
  sorted: StatusTransition[],
  timeMs: number,
  categoryByStatusName?: ReadonlyMap<string, BarStatusCategory>
): {
  statusName: string;
  category: BarStatusCategory;
} {
  const first = sorted[0];
  if (timeMs < first.timestamp.getTime()) {
    return {
      statusName: first.fromStatus,
      category: resolveCategoryWithFallback(first.fromCategory, first.fromStatus, categoryByStatusName),
    };
  }

  let lo = 0;
  let hi = sorted.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = sorted[mid].timestamp.getTime();
    if (t <= timeMs) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const tr = sorted[ans];
  return {
    statusName: tr.toStatus,
    category: resolveCategoryWithFallback(tr.toCategory, tr.toStatus, categoryByStatusName),
  };
}

function mergeAdjacentSections(sections: BarStatusSection[]): BarStatusSection[] {
  if (sections.length <= 1) return sections;

  const out: BarStatusSection[] = [];
  for (const s of sections) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.statusName === s.statusName &&
      prev.category === s.category &&
      prev.endDate.getTime() === s.startDate.getTime()
    ) {
      prev.endDate = s.endDate;
    } else {
      out.push({
        statusName: s.statusName,
        category: s.category,
        startDate: s.startDate,
        endDate: s.endDate,
      });
    }
  }
  return out;
}

/**
 * Builds contiguous status segments for a Gantt bar from changelog transitions, clipped to `[barStart, barEnd]`.
 *
 * - Empty `transitions`: one `todo` section for the whole bar (`statusName` empty).
 * - State before the first transition uses `transitions[0].fromStatus` / `fromCategory` (category defaults to `todo` when unresolved).
 * - Each transition applies from its `timestamp` onward (`toStatus` / `toCategory`).
 * - Transitions strictly before `barStart` are applied so the first visible segment reflects issue state at `barStart`.
 *
 * `categoryByStatusName` is used as a fallback when the changelog does not carry category metadata
 * (typical for Jira Server): if a transition has empty `fromCategory`/`toCategory`, the resolver
 * looks up the status name in this map to recover the proper {@link BarStatusCategory}.
 */
export function computeStatusSections(
  transitions: StatusTransition[],
  barStart: Date,
  barEnd: Date,
  categoryByStatusName?: ReadonlyMap<string, BarStatusCategory>
): BarStatusSection[] {
  const barStartMs = barStart.getTime();
  const barEndMs = barEnd.getTime();

  if (barEndMs < barStartMs) return [];

  if (!transitions.length) {
    return [
      {
        statusName: '',
        category: 'todo',
        startDate: barStart,
        endDate: barEnd,
      },
    ];
  }

  const sorted = [...transitions].sort(compareTransitionTime);

  const splitMs = new Set<number>([barStartMs, barEndMs]);
  for (const tr of sorted) {
    const ms = tr.timestamp.getTime();
    if (ms > barStartMs && ms < barEndMs) {
      splitMs.add(ms);
    }
  }

  const points = [...splitMs].sort((a, b) => a - b);
  const raw: BarStatusSection[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const startMs = points[i];
    const endMs = points[i + 1];
    if (startMs === endMs) continue;

    const { statusName, category } = resolveStateAtOrAfterTransition(sorted, startMs, categoryByStatusName);
    raw.push({
      statusName,
      category,
      startDate: new Date(startMs),
      endDate: new Date(endMs),
    });
  }

  return mergeAdjacentSections(raw);
}
