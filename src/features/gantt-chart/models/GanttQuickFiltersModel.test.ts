import { describe, expect, it } from 'vitest';
import { GanttQuickFiltersModel } from './GanttQuickFiltersModel';
import type { GanttBar, QuickFilter } from '../types';
import type { GanttIssueInput } from '../utils/computeBars';
import { BUILT_IN_QUICK_FILTERS, BUILT_IN_QUICK_FILTER_IDS } from '../quickFilters/builtIns';

function issue(overrides: Partial<GanttIssueInput> = {}): GanttIssueInput {
  return {
    id: '1',
    key: 'PROJ-1',
    fields: {
      summary: 'A',
      status: { name: 'In Progress', statusCategory: { key: 'indeterminate' } },
      ...((overrides.fields as Record<string, unknown> | undefined) ?? {}),
    },
    ...overrides,
  };
}

function bar(overrides: Partial<GanttBar> = {}): GanttBar {
  return {
    issueKey: 'PROJ-1',
    issueId: '1',
    label: 'PROJ-1: Some summary',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-10'),
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

describe('GanttQuickFiltersModel', () => {
  it('starts with no active filters and empty search', () => {
    const m = new GanttQuickFiltersModel();
    expect(m.activeIds).toEqual([]);
    expect(m.searchQuery).toBe('');
  });

  it('toggles an id on and off', () => {
    const m = new GanttQuickFiltersModel();
    m.toggle('builtin:unresolved');
    expect(m.isActive('builtin:unresolved')).toBe(true);
    m.toggle('builtin:unresolved');
    expect(m.isActive('builtin:unresolved')).toBe(false);
  });

  it('keeps insertion order when toggling multiple filters', () => {
    const m = new GanttQuickFiltersModel();
    m.toggle('a');
    m.toggle('b');
    m.toggle('c');
    expect(m.activeIds).toEqual(['a', 'b', 'c']);
  });

  it('setSearch stores the literal value (no normalization)', () => {
    const m = new GanttQuickFiltersModel();
    m.setSearch('  Foo Bar  ');
    expect(m.searchQuery).toBe('  Foo Bar  ');
  });

  it('clear() resets both active filters and search', () => {
    const m = new GanttQuickFiltersModel();
    m.toggle('x');
    m.setSearch('hello');
    m.clear();
    expect(m.activeIds).toEqual([]);
    expect(m.searchQuery).toBe('');
  });

  it('setSearchMode updates mode; clear() resets mode to text without clearing search value on mode switch', () => {
    const m = new GanttQuickFiltersModel();
    expect(m.searchMode).toBe('text');
    m.setSearch('priority = High');
    m.setSearchMode('jql');
    expect(m.searchMode).toBe('jql');
    expect(m.searchQuery).toBe('priority = High');
    m.setSearchMode('text');
    expect(m.searchMode).toBe('text');
    expect(m.searchQuery).toBe('priority = High');
    m.setSearchMode('jql');
    m.clear();
    expect(m.searchMode).toBe('text');
    expect(m.searchQuery).toBe('');
  });

  it('pruneMissingIds drops ids not in the known list (e.g. preset deleted in settings)', () => {
    const m = new GanttQuickFiltersModel();
    m.toggle('a');
    m.toggle('b');
    m.toggle('c');
    m.pruneMissingIds(['a', 'c']);
    expect(m.activeIds).toEqual(['a', 'c']);
  });

  it('syncAvailableFilters exposes built-ins before custom filters and prunes removed custom ids', () => {
    const m = new GanttQuickFiltersModel();
    const custom: QuickFilter = {
      id: 'custom:backend',
      name: 'Backend',
      selector: { mode: 'field', fieldId: 'Platform', value: 'Backend' },
    };
    m.toggle('custom:backend');
    m.toggle('custom:deleted');

    m.syncAvailableFilters([...BUILT_IN_QUICK_FILTERS, custom]);

    expect(m.availableFilters.map(f => f.id)).toEqual([
      BUILT_IN_QUICK_FILTER_IDS.unresolved,
      BUILT_IN_QUICK_FILTER_IDS.hideCompleted,
      'custom:backend',
    ]);
    expect(m.activeIds).toEqual(['custom:backend']);
    expect(m.activeFilters.map(f => f.id)).toEqual(['custom:backend']);
  });

  it('applyToBars uses active filters and search state from the model', () => {
    const m = new GanttQuickFiltersModel();
    const high: QuickFilter = {
      id: 'custom:high',
      name: 'High priority',
      selector: { mode: 'field', fieldId: 'priority', value: 'High' },
    };
    m.syncAvailableFilters([...BUILT_IN_QUICK_FILTERS, high]);
    m.toggle('custom:high');
    m.setSearch('auth');

    const issuesByKey = new Map<string, GanttIssueInput>([
      ['A-1', issue({ key: 'A-1', fields: { priority: { name: 'High' } } })],
      ['A-2', issue({ key: 'A-2', fields: { priority: { name: 'Low' } } })],
      ['A-3', issue({ key: 'A-3', fields: { priority: { name: 'High' } } })],
    ]);
    const result = m.applyToBars(
      [
        bar({ issueKey: 'A-1', label: 'A-1: auth backend' }),
        bar({ issueKey: 'A-2', label: 'A-2: auth frontend' }),
        bar({ issueKey: 'A-3', label: 'A-3: billing backend' }),
      ],
      issuesByKey
    );

    expect(result.bars.map(b => b.issueKey)).toEqual(['A-1']);
    expect(result.hiddenCount).toBe(2);
  });
});
