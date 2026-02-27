import { describe, it, expect } from 'vitest';
import { createPersonLimit } from './createPersonLimit';
import type { FormData } from '../state/types';

describe('createPersonLimit', () => {
  const mockFormData: FormData = {
    person: {
      name: 'john.doe',
      displayName: 'John Doe',
      avatar: 'https://jira.example.com/avatar.png',
      self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
    },
    limit: 5,
    selectedColumns: ['col1', 'col2'],
    swimlanes: ['swim1', 'swim2'],
    includedIssueTypes: ['bug', 'task'],
  };

  const mockPerson = {
    name: 'john.doe',
    displayName: 'John Doe',
    self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
    avatar: 'https://jira.example.com/avatar.png',
  };

  const mockColumns = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
  ];

  const mockSwimlanes = [
    { id: 'swim1', name: 'Frontend' },
    { id: 'swim2', name: 'Backend' },
  ];

  it('should create a PersonLimit from FormData', () => {
    const id = 1234567890;
    const result = createPersonLimit({
      formData: mockFormData,
      person: mockPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result).toEqual({
      id,
      person: mockPerson,
      limit: 5,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      includedIssueTypes: ['bug', 'task'],
    });
  });

  it('should create PersonLimit without includedIssueTypes if not provided', () => {
    const formDataWithoutTypes: FormData = {
      ...mockFormData,
      includedIssueTypes: undefined,
    };

    const id = 1234567891;
    const result = createPersonLimit({
      formData: formDataWithoutTypes,
      person: mockPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result.includedIssueTypes).toBeUndefined();
    expect(result).toEqual({
      id,
      person: mockPerson,
      limit: 5,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });
  });

  it('should filter columns to only include selected ones', () => {
    const allColumns = [
      { id: 'col1', name: 'To Do' },
      { id: 'col2', name: 'In Progress' },
      { id: 'col3', name: 'Done' },
    ];

    const formData: FormData = {
      ...mockFormData,
      selectedColumns: ['col1', 'col3'],
    };

    const id = 1234567892;
    const result = createPersonLimit({
      formData,
      person: mockPerson,
      columns: allColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result.columns).toEqual([
      { id: 'col1', name: 'To Do' },
      { id: 'col3', name: 'Done' },
    ]);
  });

  it('should filter swimlanes to only include selected ones', () => {
    const allSwimlanes = [
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim2', name: 'Backend' },
      { id: 'swim3', name: 'QA' },
    ];

    const formData: FormData = {
      ...mockFormData,
      swimlanes: ['swim1', 'swim3'],
    };

    const id = 1234567893;
    const result = createPersonLimit({
      formData,
      person: mockPerson,
      columns: mockColumns,
      swimlanes: allSwimlanes,
      id,
    });

    expect(result.swimlanes).toEqual([
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim3', name: 'QA' },
    ]);
  });

  it('should handle swimlanes without id (use name as id)', () => {
    const swimlanesWithoutId = [{ name: 'Frontend' }, { name: 'Backend' }];

    const formData: FormData = {
      ...mockFormData,
      swimlanes: ['Frontend', 'Backend'],
    };

    const id = 1234567894;
    const result = createPersonLimit({
      formData,
      person: mockPerson,
      columns: mockColumns,
      swimlanes: swimlanesWithoutId,
      id,
    });

    expect(result.swimlanes).toEqual([
      { id: 'Frontend', name: 'Frontend' },
      { id: 'Backend', name: 'Backend' },
    ]);
  });

  it('should handle empty selectedColumns', () => {
    const formData: FormData = {
      ...mockFormData,
      selectedColumns: [],
    };

    const id = 1234567895;
    const result = createPersonLimit({
      formData,
      person: mockPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result.columns).toEqual([]);
  });

  it('should handle empty swimlanes', () => {
    const formData: FormData = {
      ...mockFormData,
      swimlanes: [],
    };

    const id = 1234567896;
    const result = createPersonLimit({
      formData,
      person: mockPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      id,
    });

    expect(result.swimlanes).toEqual([]);
  });
});
