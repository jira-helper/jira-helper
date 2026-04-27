/**
 * @module GanttQuickFiltersModel
 *
 * Session-only state for the toolbar quick filters: which preset chips are currently active and the
 * live search query. The presets themselves (custom + built-in) live in `GanttScopeSettings.quickFilters`
 * and `BUILT_IN_QUICK_FILTERS` respectively — this model only tracks the user's transient selection.
 *
 * Active state is intentionally NOT persisted, mirroring how Jira boards reset quick filters between
 * sessions. The set is stored as an array (not a `Set`) so it stays cleanly serializable for valtio
 * snapshots and React rendering.
 */
import type { JiraField } from 'src/infrastructure/jira/types';
import type { GanttBar, QuickFilter } from '../types';
import type { GanttIssueInput } from '../utils/computeBars';
import { applyQuickFiltersToBars } from '../quickFilters/applyQuickFiltersToBars';
import { BUILT_IN_QUICK_FILTERS } from '../quickFilters/builtIns';

export type QuickFilterSearchMode = 'text' | 'jql';

export class GanttQuickFiltersModel {
  activeIds: string[] = [];

  searchQuery: string = '';

  /** Session-only; default `text` after reload (FR-17). */
  searchMode: QuickFilterSearchMode = 'text';

  /** Built-in presets followed by custom presets from the resolved Gantt settings. */
  availableFilters: QuickFilter[] = [...BUILT_IN_QUICK_FILTERS];

  get activeFilters(): QuickFilter[] {
    const active = new Set(this.activeIds);
    return this.availableFilters.filter(f => active.has(f.id));
  }

  isActive(id: string): boolean {
    return this.activeIds.includes(id);
  }

  toggle(id: string): void {
    if (this.isActive(id)) {
      this.activeIds = this.activeIds.filter(x => x !== id);
    } else {
      this.activeIds = [...this.activeIds, id];
    }
  }

  setSearch(query: string): void {
    this.searchQuery = query;
  }

  setSearchMode(mode: QuickFilterSearchMode): void {
    this.searchMode = mode;
  }

  /** Drops any active selections that no longer correspond to an existing preset id. */
  pruneMissingIds(knownIds: ReadonlyArray<string>): void {
    const known = new Set(knownIds);
    this.activeIds = this.activeIds.filter(id => known.has(id));
  }

  /** Syncs available presets from resolved settings state and prunes removed active ids. */
  syncAvailableFilters(availableFilters: ReadonlyArray<QuickFilter> = BUILT_IN_QUICK_FILTERS): void {
    this.availableFilters = [...availableFilters];
    this.pruneMissingIds(this.availableFilters.map(f => f.id));
  }

  applyToBars(
    bars: ReadonlyArray<GanttBar>,
    issuesByKey: ReadonlyMap<string, GanttIssueInput>,
    fields: ReadonlyArray<JiraField> = []
  ): { bars: GanttBar[]; hiddenCount: number } {
    return applyQuickFiltersToBars(
      [...bars],
      issuesByKey,
      this.activeFilters,
      { mode: this.searchMode, value: this.searchQuery },
      fields
    );
  }

  clear(): void {
    this.activeIds = [];
    this.searchQuery = '';
    this.searchMode = 'text';
  }
}
