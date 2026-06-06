import { parseJql } from 'src/shared/jql/simpleJqlParser';
import type { JiraField } from 'src/infrastructure/jira/types';
import { getFieldValueForJql } from 'src/infrastructure/jira/fields/getFieldValueForJql';
import type { GanttBar, QuickFilter } from '../types';
import type { GanttIssueInput } from '../utils/computeBars';
import type { QuickFilterSearchMode } from '../models/GanttQuickFiltersModel';
import { matchQuickFilter } from './matchQuickFilter';

export type QuickFilterLiveSearch = {
  mode: QuickFilterSearchMode;
  value: string;
};

export type ApplyQuickFiltersResult = {
  /** Bars that pass ALL active filters AND the live search query. */
  bars: GanttBar[];
  /** Number of bars hidden by quick filters or search (for status/empty hints). */
  hiddenCount: number;
};

function searchNarrowsBars(search: QuickFilterLiveSearch): boolean {
  const t = search.value.trim();
  if (!t) return false;
  if (search.mode === 'text') return true;
  try {
    parseJql(t);
    return true;
  } catch {
    return false;
  }
}

function matchesSearch(
  bar: GanttBar,
  search: QuickFilterLiveSearch,
  issuesByKey: ReadonlyMap<string, GanttIssueInput>,
  fields: ReadonlyArray<JiraField>
): boolean {
  if (search.mode === 'text') {
    const q = search.value.trim().toLowerCase();
    if (!q) return true;
    return bar.label.toLowerCase().includes(q);
  }
  const jql = search.value.trim();
  if (!jql) return true;
  try {
    const matcher = parseJql(jql);
    const issue = issuesByKey.get(bar.issueKey);
    if (!issue) return true;
    return matcher(getFieldValueForJql(issue, fields));
  } catch {
    return true;
  }
}

/**
 * Applies the toolbar quick filters to already-computed Gantt bars.
 *
 * Semantics:
 * - Active quick filters combine using AND — a bar must pass every active filter (matches Jira boards).
 * - Search: `text` mode — case-insensitive substring on `KEY: summary`; `jql` mode — {@link parseJql}
 *   + {@link getFieldValueForJql} (invalid or empty JQL does not narrow — graceful, same as chip JQL).
 * - When `activeFilters` is empty and search does not narrow, returns the input bars unchanged.
 *
 * `issuesByKey` provides the raw issue payload that field/JQL selectors need; bars without
 * a matching issue input are passed through unchanged (defensive — should not happen in practice).
 */
export function applyQuickFiltersToBars(
  bars: GanttBar[],
  issuesByKey: ReadonlyMap<string, GanttIssueInput>,
  activeFilters: ReadonlyArray<QuickFilter>,
  search: QuickFilterLiveSearch,
  fields: ReadonlyArray<JiraField> = []
): ApplyQuickFiltersResult {
  const hasFilters = activeFilters.length > 0;
  const searchActive = searchNarrowsBars(search);
  if (!hasFilters && !searchActive) {
    return { bars, hiddenCount: 0 };
  }

  const out: GanttBar[] = [];
  let hidden = 0;
  for (const bar of bars) {
    if (!matchesSearch(bar, search, issuesByKey, fields)) {
      hidden += 1;
      continue;
    }
    if (hasFilters) {
      const issue = issuesByKey.get(bar.issueKey);
      if (issue) {
        const passesAll = activeFilters.every(f => matchQuickFilter(issue, f, fields));
        if (!passesAll) {
          hidden += 1;
          continue;
        }
      }
    }
    out.push(bar);
  }
  return { bars: out, hiddenCount: hidden };
}
