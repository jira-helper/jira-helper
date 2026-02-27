import { describe, it, expect } from 'vitest';
import { updatePersonLimit } from './updatePersonLimit';
import type { FormData, PersonLimit } from '../state/types';

describe('updatePersonLimit', () => {
  const existingLimit: PersonLimit = {
    id: 1,
    person: {
      name: 'john.doe',
      displayName: 'John Doe',
      self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
      avatar: 'https://jira.example.com/avatar.png',
    },
    limit: 5,
    columns: [{ id: 'col1', name: 'To Do' }],
    swimlanes: [{ id: 'swim1', name: 'Frontend' }],
    includedIssueTypes: ['bug'],
  };

  const mockFormData: FormData = {
    person: {
      name: 'john.doe',
      displayName: 'John Doe',
      avatar: 'https://jira.example.com/avatar.png',
      self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
    },
    limit: 10,
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

  it('should update a PersonLimit from FormData', () => {
    const result = updatePersonLimit({
      existingLimit,
      formData: mockFormData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result).toEqual({
      id: 1,
      person: {
        name: mockFormData.person!.name,
        displayName: mockFormData.person!.displayName,
        avatar: mockFormData.person!.avatar,
        self: mockFormData.person!.self,
      },
      limit: 10,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      includedIssueTypes: ['bug', 'task'],
    });
  });

  it('should use person data from formData when provided', () => {
    const result = updatePersonLimit({
      existingLimit,
      formData: mockFormData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.person.name).toEqual(mockFormData.person!.name);
    expect(result.person.displayName).toEqual(mockFormData.person!.displayName);
    expect(result.person.self).toEqual(mockFormData.person!.self);
    expect(result.person.avatar).toEqual(mockFormData.person!.avatar);
    expect(result.person).not.toBe(existingLimit.person);
  });

  it('should update person from formData with new user', () => {
    const formDataWithNewPerson: FormData = {
      ...mockFormData,
      person: {
        name: 'jane.doe',
        displayName: 'Jane Doe',
        avatar: 'https://jira.example.com/jane-avatar.png',
        self: 'https://jira.example.com/rest/api/2/user?username=jane.doe',
      },
    };

    const result = updatePersonLimit({
      existingLimit,
      formData: formDataWithNewPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.person.name).toEqual('jane.doe');
    expect(result.person.displayName).toEqual('Jane Doe');
    expect(result.person.avatar).toEqual('https://jira.example.com/jane-avatar.png');
  });

  it('should preserve existing person when formData.person is null', () => {
    const formDataNoPerson: FormData = {
      ...mockFormData,
      person: null,
    };

    const result = updatePersonLimit({
      existingLimit,
      formData: formDataNoPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.person).toEqual(existingLimit.person);
  });

  it('should remove includedIssueTypes if not provided in formData', () => {
    const formDataWithoutTypes: FormData = {
      ...mockFormData,
      includedIssueTypes: undefined,
    };

    const result = updatePersonLimit({
      existingLimit,
      formData: formDataWithoutTypes,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.includedIssueTypes).toBeUndefined();
  });

  it('should update only selected columns', () => {
    const allColumns = [
      { id: 'col1', name: 'To Do' },
      { id: 'col2', name: 'In Progress' },
      { id: 'col3', name: 'Done' },
    ];

    const formData: FormData = {
      ...mockFormData,
      selectedColumns: ['col2', 'col3'],
    };

    const result = updatePersonLimit({
      existingLimit,
      formData,
      columns: allColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.columns).toEqual([
      { id: 'col2', name: 'In Progress' },
      { id: 'col3', name: 'Done' },
    ]);
  });

  it('should update only selected swimlanes', () => {
    const allSwimlanes = [
      { id: 'swim1', name: 'Frontend' },
      { id: 'swim2', name: 'Backend' },
      { id: 'swim3', name: 'QA' },
    ];

    const formData: FormData = {
      ...mockFormData,
      swimlanes: ['swim2', 'swim3'],
    };

    const result = updatePersonLimit({
      existingLimit,
      formData,
      columns: mockColumns,
      swimlanes: allSwimlanes,
    });

    expect(result.swimlanes).toEqual([
      { id: 'swim2', name: 'Backend' },
      { id: 'swim3', name: 'QA' },
    ]);
  });

  it('should handle swimlanes without id (use name as id)', () => {
    const swimlanesWithoutId = [{ name: 'Frontend' }, { name: 'Backend' }];

    const formData: FormData = {
      ...mockFormData,
      swimlanes: ['Frontend', 'Backend'],
    };

    const result = updatePersonLimit({
      existingLimit,
      formData,
      columns: mockColumns,
      swimlanes: swimlanesWithoutId,
    });

    expect(result.swimlanes).toEqual([
      { id: 'Frontend', name: 'Frontend' },
      { id: 'Backend', name: 'Backend' },
    ]);
  });

  it('should return a new object (immutability)', () => {
    const result = updatePersonLimit({
      existingLimit,
      formData: mockFormData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result).not.toBe(existingLimit);
    expect(result.columns).not.toBe(existingLimit.columns);
    expect(result.swimlanes).not.toBe(existingLimit.swimlanes);
  });
});
