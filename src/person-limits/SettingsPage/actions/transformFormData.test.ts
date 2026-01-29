import { describe, it, expect } from 'vitest';
import { transformFormData } from './transformFormData';
import type { Column, Swimlane } from '../state/types';

describe('transformFormData', () => {
  const mockColumns: Column[] = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
    { id: 'col3', name: 'Done' },
  ];

  const mockSwimlanes: Swimlane[] = [
    { id: 'swim1', name: 'Frontend' },
    { id: 'swim2', name: 'Backend' },
    { name: 'QA' }, // without id
  ];

  it('should transform column IDs to column objects', () => {
    const selectedColumnIds = ['col1', 'col3'];
    const result = transformFormData({
      selectedColumnIds,
      selectedSwimlaneIds: [],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.columns).toEqual([
      { id: 'col1', name: 'To Do' },
      { id: 'col3', name: 'Done' },
    ]);
  });

  it('should transform swimlane IDs to swimlane objects', () => {
    const selectedSwimlaneIds = ['swim1', 'swim2'];
    const result = transformFormData({
      selectedColumnIds: [],
      selectedSwimlaneIds,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.swimlanes).toEqual([
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim2', name: 'Backend' },
    ]);
  });

  it('should handle swimlanes without id (use name as id)', () => {
    const selectedSwimlaneIds = ['QA'];
    const result = transformFormData({
      selectedColumnIds: [],
      selectedSwimlaneIds,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.swimlanes).toEqual([
      { id: 'QA', name: 'QA' },
    ]);
  });

  it('should filter out non-existent column IDs', () => {
    const selectedColumnIds = ['col1', 'non-existent', 'col3'];
    const result = transformFormData({
      selectedColumnIds,
      selectedSwimlaneIds: [],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.columns).toEqual([
      { id: 'col1', name: 'To Do' },
      { id: 'col3', name: 'Done' },
    ]);
  });

  it('should filter out non-existent swimlane IDs', () => {
    const selectedSwimlaneIds = ['swim1', 'non-existent', 'swim2'];
    const result = transformFormData({
      selectedColumnIds: [],
      selectedSwimlaneIds,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.swimlanes).toEqual([
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim2', name: 'Backend' },
    ]);
  });

  it('should preserve empty arrays (meaning "all columns/swimlanes")', () => {
    const result = transformFormData({
      selectedColumnIds: [],
      selectedSwimlaneIds: [],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    // Empty arrays are preserved to mean "all"
    expect(result.columns).toEqual([]);
    expect(result.swimlanes).toEqual([]);
  });

  it('should preserve empty columns array when swimlanes are selected', () => {
    const result = transformFormData({
      selectedColumnIds: [], // empty = all columns
      selectedSwimlaneIds: ['swim1'],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.columns).toEqual([]);
    expect(result.swimlanes).toEqual([{ id: 'swim1', name: 'Frontend' }]);
  });

  it('should preserve empty swimlanes array when columns are selected', () => {
    const result = transformFormData({
      selectedColumnIds: ['col1'],
      selectedSwimlaneIds: [], // empty = all swimlanes
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.columns).toEqual([{ id: 'col1', name: 'To Do' }]);
    expect(result.swimlanes).toEqual([]);
  });

  it('should preserve order of selected items', () => {
    const selectedColumnIds = ['col3', 'col1', 'col2'];
    const result = transformFormData({
      selectedColumnIds,
      selectedSwimlaneIds: [],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.columns.map(c => c.id)).toEqual(['col3', 'col1', 'col2']);
  });
});
