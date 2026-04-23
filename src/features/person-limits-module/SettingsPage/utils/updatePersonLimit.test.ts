import { describe, it, expect } from 'vitest';
import { updatePersonLimit } from './updatePersonLimit';
import type { FormData, PersonLimit } from '../state/types';

describe('updatePersonLimit', () => {
  const existingLimit: PersonLimit = {
    id: 1,
    persons: [
      {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
      },
    ],
    limit: 5,
    columns: [{ id: 'col1', name: 'To Do' }],
    swimlanes: [{ id: 'swim1', name: 'Frontend' }],
    includedIssueTypes: ['bug'],
    showAllPersonIssues: true,
  };

  const mockFormData: FormData = {
    persons: [
      {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
      },
    ],
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
      persons: [
        {
          name: mockFormData.persons![0].name,
          displayName: mockFormData.persons![0].displayName,
          self: mockFormData.persons![0].self,
        },
      ],
      limit: 10,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
      includedIssueTypes: ['bug', 'task'],
      showAllPersonIssues: true,
      sharedLimit: false,
    });
  });

  describe('sharedLimit', () => {
    const johnDoe = existingLimit.persons[0];
    const janeDoe = {
      name: 'jane.doe',
      displayName: 'Jane Doe',
      self: 'https://jira.example.com/rest/api/2/user?username=jane.doe',
    };

    it('forces sharedLimit=false when reduced to a single person', () => {
      const result = updatePersonLimit({
        existingLimit: { ...existingLimit, persons: [johnDoe, janeDoe], sharedLimit: true },
        formData: { ...mockFormData, persons: [johnDoe], sharedLimit: true },
        columns: mockColumns,
        swimlanes: mockSwimlanes,
      });
      expect(result.sharedLimit).toBe(false);
    });

    it('keeps sharedLimit=true when ≥2 persons and form requests it', () => {
      const result = updatePersonLimit({
        existingLimit: { ...existingLimit, persons: [johnDoe, janeDoe] },
        formData: { ...mockFormData, persons: [johnDoe, janeDoe], sharedLimit: true },
        columns: mockColumns,
        swimlanes: mockSwimlanes,
      });
      expect(result.sharedLimit).toBe(true);
    });

    it('falls back to existing sharedLimit when form omits it', () => {
      const result = updatePersonLimit({
        existingLimit: { ...existingLimit, persons: [johnDoe, janeDoe], sharedLimit: true },
        formData: { ...mockFormData, persons: [johnDoe, janeDoe] },
        columns: mockColumns,
        swimlanes: mockSwimlanes,
      });
      expect(result.sharedLimit).toBe(true);
    });
  });

  it('should use person data from formData when provided', () => {
    const result = updatePersonLimit({
      existingLimit,
      formData: mockFormData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.persons[0].name).toEqual(mockFormData.persons![0].name);
    expect(result.persons[0].displayName).toEqual(mockFormData.persons![0].displayName);
    expect(result.persons[0].self).toEqual(mockFormData.persons![0].self);
    expect(result.persons[0]).not.toBe(existingLimit.persons[0]);
  });

  it('should update person from formData with new user', () => {
    const formDataWithNewPerson: FormData = {
      ...mockFormData,
      persons: [
        {
          name: 'jane.doe',
          displayName: 'Jane Doe',
          self: 'https://jira.example.com/rest/api/2/user?username=jane.doe',
        },
      ],
    };

    const result = updatePersonLimit({
      existingLimit,
      formData: formDataWithNewPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.persons[0].name).toEqual('jane.doe');
    expect(result.persons[0].displayName).toEqual('Jane Doe');
  });

  it('should preserve existing person when formData.persons is empty', () => {
    const formDataNoPerson: FormData = {
      ...mockFormData,
      persons: [],
    };

    const result = updatePersonLimit({
      existingLimit,
      formData: formDataNoPerson,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.persons).toEqual(existingLimit.persons);
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

  it('should update showAllPersonIssues from true to false', () => {
    const formData: FormData = {
      ...mockFormData,
      showAllPersonIssues: false,
    };

    const result = updatePersonLimit({
      existingLimit,
      formData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.showAllPersonIssues).toBe(false);
  });

  it('should preserve existing showAllPersonIssues when formData does not specify it', () => {
    const limitWithFalse: PersonLimit = {
      ...existingLimit,
      showAllPersonIssues: false,
    };
    const formData: FormData = {
      ...mockFormData,
    };
    delete formData.showAllPersonIssues;

    const result = updatePersonLimit({
      existingLimit: limitWithFalse,
      formData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.showAllPersonIssues).toBe(false);
  });

  it('should update showAllPersonIssues from false to true', () => {
    const limitWithFalse: PersonLimit = {
      ...existingLimit,
      showAllPersonIssues: false,
    };
    const formData: FormData = {
      ...mockFormData,
      showAllPersonIssues: true,
    };

    const result = updatePersonLimit({
      existingLimit: limitWithFalse,
      formData,
      columns: mockColumns,
      swimlanes: mockSwimlanes,
    });

    expect(result.showAllPersonIssues).toBe(true);
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
