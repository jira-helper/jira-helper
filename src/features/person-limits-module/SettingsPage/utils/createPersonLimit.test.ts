import { describe, it, expect } from 'vitest';
import { createPersonLimit } from './createPersonLimit';
import type { FormData } from '../state/types';

describe('createPersonLimit', () => {
  const johnDoe = {
    name: 'john.doe',
    displayName: 'John Doe',
    self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
  };

  const janeSmith = {
    name: 'jane.smith',
    displayName: 'Jane Smith',
    self: 'https://jira.example.com/rest/api/2/user?username=jane.smith',
  };

  const mockFormData: FormData = {
    persons: [johnDoe],
    limit: 5,
    selectedColumns: ['col1', 'col2'],
    swimlanes: ['swim1', 'swim2'],
    includedIssueTypes: ['bug', 'task'],
  };

  const mockColumns = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
  ];

  const mockSwimlanes = [
    { id: 'swim1', name: 'Frontend' },
    { id: 'swim2', name: 'Backend' },
  ];

  it('creates a PersonLimit from FormData with a single person', () => {
    const id = 1234567890;
    const result = createPersonLimit({
      formData: mockFormData,
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result).toEqual({
      id,
      persons: [johnDoe],
      limit: 5,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      includedIssueTypes: ['bug', 'task'],
      showAllPersonIssues: true,
      sharedLimit: false,
    });
  });

  describe('sharedLimit', () => {
    it('defaults sharedLimit to false', () => {
      const result = createPersonLimit({
        formData: mockFormData,
        persons: [johnDoe],
        columns: mockColumns,
        swimlanes: mockSwimlanes,
        id: 1,
      });
      expect(result.sharedLimit).toBe(false);
    });

    it('preserves sharedLimit=true when at least 2 persons are selected', () => {
      const result = createPersonLimit({
        formData: { ...mockFormData, persons: [johnDoe, janeSmith], sharedLimit: true },
        persons: [johnDoe, janeSmith],
        columns: mockColumns,
        swimlanes: mockSwimlanes,
        id: 2,
      });
      expect(result.sharedLimit).toBe(true);
    });

    it('forces sharedLimit=false for a single-person limit even when form says true', () => {
      const result = createPersonLimit({
        formData: { ...mockFormData, sharedLimit: true },
        persons: [johnDoe],
        columns: mockColumns,
        swimlanes: mockSwimlanes,
        id: 3,
      });
      expect(result.sharedLimit).toBe(false);
    });
  });

  it('creates a PersonLimit with multiple persons sharing the same limit and filters', () => {
    const id = 1234567899;
    const result = createPersonLimit({
      formData: { ...mockFormData, persons: [johnDoe, janeSmith] },
      persons: [johnDoe, janeSmith],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result.persons).toEqual([johnDoe, janeSmith]);
    expect(result.limit).toBe(5);
    expect(result.columns).toEqual(mockColumns);
    expect(result.swimlanes).toEqual(mockSwimlanes);
    expect(result.includedIssueTypes).toEqual(['bug', 'task']);
  });

  it('throws when persons array is empty', () => {
    expect(() =>
      createPersonLimit({
        formData: mockFormData,
        persons: [],
        columns: mockColumns,
        swimlanes: mockSwimlanes,
        id: 1,
      })
    ).toThrow(/at least one person/);
  });

  it('omits includedIssueTypes when not provided', () => {
    const formDataWithoutTypes: FormData = {
      ...mockFormData,
      includedIssueTypes: undefined,
    };

    const result = createPersonLimit({
      formData: formDataWithoutTypes,
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id: 1234567891,
    });

    expect(result.includedIssueTypes).toBeUndefined();
  });

  it('filters columns to only the selected ones', () => {
    const allColumns = [
      { id: 'col1', name: 'To Do' },
      { id: 'col2', name: 'In Progress' },
      { id: 'col3', name: 'Done' },
    ];

    const result = createPersonLimit({
      formData: { ...mockFormData, selectedColumns: ['col1', 'col3'] },
      persons: [johnDoe],
      columns: allColumns,
      swimlanes: mockSwimlanes,
      id: 1234567892,
    });

    expect(result.columns).toEqual([
      { id: 'col1', name: 'To Do' },
      { id: 'col3', name: 'Done' },
    ]);
  });

  it('filters swimlanes to only the selected ones', () => {
    const allSwimlanes = [
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim2', name: 'Backend' },
      { id: 'swim3', name: 'QA' },
    ];

    const result = createPersonLimit({
      formData: { ...mockFormData, swimlanes: ['swim1', 'swim3'] },
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: allSwimlanes,
      id: 1234567893,
    });

    expect(result.swimlanes).toEqual([
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim3', name: 'QA' },
    ]);
  });

  it('uses name as id for swimlanes without id', () => {
    const swimlanesWithoutId = [{ name: 'Frontend' }, { name: 'Backend' }];

    const result = createPersonLimit({
      formData: { ...mockFormData, swimlanes: ['Frontend', 'Backend'] },
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: swimlanesWithoutId,
      id: 1234567894,
    });

    expect(result.swimlanes).toEqual([
      { id: 'Frontend', name: 'Frontend' },
      { id: 'Backend', name: 'Backend' },
    ]);
  });

  it('honors empty selectedColumns and swimlanes', () => {
    const result = createPersonLimit({
      formData: { ...mockFormData, selectedColumns: [], swimlanes: [] },
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id: 1234567895,
    });

    expect(result.columns).toEqual([]);
    expect(result.swimlanes).toEqual([]);
  });

  it('passes through showAllPersonIssues flag', () => {
    const off = createPersonLimit({
      formData: { ...mockFormData, showAllPersonIssues: false },
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id: 1234567897,
    });
    expect(off.showAllPersonIssues).toBe(false);

    const noFlag: FormData = { ...mockFormData };
    delete noFlag.showAllPersonIssues;
    const on = createPersonLimit({
      formData: noFlag,
      persons: [johnDoe],
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id: 1234567898,
    });
    expect(on.showAllPersonIssues).toBe(true);
  });
});
