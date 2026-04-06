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

    expect(result.swimlanes).toEqual([{ id: 'QA', name: 'QA' }]);
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

  describe('Type mismatch: string IDs vs numeric column/swimlane IDs', () => {
    it('should match columns when selectedColumnIds are strings but columns[].id are numbers', () => {
      // Simulate board API returning numeric IDs
      // But we need to actually test with numbers - cast to bypass TypeScript
      const numericColumns = [
        { id: 123, name: 'To Do' },
        { id: 456, name: 'In Progress' },
        { id: 789, name: 'Done' },
      ] as unknown as Column[];

      // Form provides string IDs (after normalization)
      const selectedColumnIds = ['123', '789'];
      const result = transformFormData({
        selectedColumnIds,
        selectedSwimlaneIds: [],
        columns: numericColumns,
        swimlanes: mockSwimlanes,
      });

      // Should find and return the columns, not empty array
      expect(result.columns.length).toBe(2);
      expect(result.columns[0].name).toBe('To Do');
      expect(result.columns[1].name).toBe('Done');
      // IDs should be normalized to strings
      expect(result.columns[0].id).toBe('123');
      expect(result.columns[1].id).toBe('789');
    });

    it('should match swimlanes when selectedSwimlaneIds are strings but swimlanes[].id are numbers', () => {
      // Simulate board API returning numeric IDs
      const numericSwimlanes = [
        { id: 100, name: 'Frontend' },
        { id: 200, name: 'Backend' },
      ] as unknown as Swimlane[];

      // Form provides string IDs (after normalization)
      const selectedSwimlaneIds = ['100', '200'];
      const result = transformFormData({
        selectedColumnIds: [],
        selectedSwimlaneIds,
        columns: mockColumns,
        swimlanes: numericSwimlanes,
      });

      // Should find and return the swimlanes, not empty array
      expect(result.swimlanes.length).toBe(2);
      expect(result.swimlanes[0].name).toBe('Frontend');
      expect(result.swimlanes[1].name).toBe('Backend');
      // IDs should be normalized to strings
      expect(result.swimlanes[0].id).toBe('100');
      expect(result.swimlanes[1].id).toBe('200');
    });

    it('should handle mixed string/number IDs correctly', () => {
      // Some columns have string IDs, some have numeric IDs (mixed scenario)
      const mixedColumns = [
        { id: 'col1', name: 'To Do' },
        { id: 456, name: 'In Progress' },
        { id: 'col3', name: 'Done' },
      ] as unknown as Column[];

      const selectedColumnIds = ['col1', '456', 'col3'];
      const result = transformFormData({
        selectedColumnIds,
        selectedSwimlaneIds: [],
        columns: mixedColumns,
        swimlanes: mockSwimlanes,
      });

      // Should find all three columns
      expect(result.columns.length).toBe(3);
      expect(result.columns.map(c => c.name)).toEqual(['To Do', 'In Progress', 'Done']);
    });
  });
});
