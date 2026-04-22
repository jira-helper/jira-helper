import { describe, expect, it } from 'vitest';
import { GanttQuickFiltersModel } from './GanttQuickFiltersModel';

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
});
