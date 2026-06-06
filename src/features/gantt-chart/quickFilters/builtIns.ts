import type { QuickFilter } from '../types';

/**
 * Stable IDs for the always-available quick filters. The toolbar shows them in this order
 * before any user-defined custom presets.
 *
 * Built-ins are NOT serialized into `GanttScopeSettings.quickFilters` — they live in code
 * so they can evolve without storage migrations. Active toggle state is shared with custom
 * filters via `GanttQuickFiltersModel.activeIds`.
 */
export const BUILT_IN_QUICK_FILTER_IDS = {
  unresolved: 'builtin:unresolved',
  hideCompleted: 'builtin:hideCompleted',
} as const;

export type BuiltInQuickFilterId = (typeof BUILT_IN_QUICK_FILTER_IDS)[keyof typeof BUILT_IN_QUICK_FILTER_IDS];

export const BUILT_IN_QUICK_FILTERS: ReadonlyArray<QuickFilter> = [
  {
    id: BUILT_IN_QUICK_FILTER_IDS.unresolved,
    name: 'Unresolved',
    // `resolution is EMPTY` is supported by the simpleJqlParser and matches the standard
    // Jira convention for "unresolved" issues — `resolution` is null when the issue is open.
    selector: { mode: 'jql', jql: 'resolution is EMPTY' },
  },
  {
    id: BUILT_IN_QUICK_FILTER_IDS.hideCompleted,
    name: 'Hide completed',
    // No JQL form would work cleanly because `statusCategory` is nested under `status`
    // and the JQL parser is field-flat. The matcher special-cases this id (see matchQuickFilter).
    selector: { mode: 'field', fieldId: '__builtin__', value: 'hideCompleted' },
  },
];

export function isBuiltInQuickFilterId(id: string): id is BuiltInQuickFilterId {
  return id === BUILT_IN_QUICK_FILTER_IDS.unresolved || id === BUILT_IN_QUICK_FILTER_IDS.hideCompleted;
}
