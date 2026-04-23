import { describe, it, expect } from 'vitest';
import { isPersonLimitAppliedToIssue } from './isPersonLimitAppliedToIssue';

describe('isPersonLimitAppliedToIssue', () => {
  const basePersons = [
    {
      name: 'john.doe',
      displayName: 'John Doe',
      avatar: 'https://example.com/avatar.png',
    },
  ];

  describe('assignee matching', () => {
    it('should return true when assignee matches displayName', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1');

      expect(result).toBe(true);
    });

    it('should return true when assignee matches name', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'john.doe', 'col-1');

      expect(result).toBe(true);
    });

    it('should return false when assignee does not match', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'Jane Doe', 'col-1');

      expect(result).toBe(false);
    });

    it('should return false when assignee is null', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, null, 'col-1');

      expect(result).toBe(false);
    });

    it('should return true when assignee matches any person in array', () => {
      const stats = {
        persons: [
          ...basePersons,
          { name: 'jane.doe', displayName: 'Jane Doe', avatar: 'https://example.com/avatar2.png' },
        ],
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'Jane Doe', 'col-1');

      expect(result).toBe(true);
    });
  });

  describe('column matching', () => {
    it('should return true when columns array is empty (all columns)', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'any-column');

      expect(result).toBe(true);
    });

    it('should return true when column is in the list', () => {
      const stats = {
        persons: basePersons,
        columns: [
          { id: 'col-1', name: 'To Do' },
          { id: 'col-2', name: 'In Progress' },
        ],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-2');

      expect(result).toBe(true);
    });

    it('should return false when column is not in the list', () => {
      const stats = {
        persons: basePersons,
        columns: [{ id: 'col-1', name: 'To Do' }],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-2');

      expect(result).toBe(false);
    });
  });

  describe('swimlane matching', () => {
    it('should return true when swimlanes array is empty (all swimlanes)', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', 'any-swimlane');

      expect(result).toBe(true);
    });

    it('should return true when swimlane is in the list', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [
          { id: 'sw-1', name: 'Swimlane 1' },
          { id: 'sw-2', name: 'Swimlane 2' },
        ],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', 'sw-2');

      expect(result).toBe(true);
    });

    it('should return false when swimlane is not in the list', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [{ id: 'sw-1', name: 'Swimlane 1' }],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', 'sw-2');

      expect(result).toBe(false);
    });

    it('should return false when swimlanes are specified but swimlaneId is null', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [{ id: 'sw-1', name: 'Swimlane 1' }],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', null);

      expect(result).toBe(false);
    });
  });

  describe('issue type matching', () => {
    it('should return true when includedIssueTypes is undefined (all types)', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
        includedIssueTypes: undefined,
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', null, 'Bug');

      expect(result).toBe(true);
    });

    it('should return true when includedIssueTypes is empty (all types)', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
        includedIssueTypes: [],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', null, 'Story');

      expect(result).toBe(true);
    });

    it('should return true when issue type is in the list', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
        includedIssueTypes: ['Bug', 'Task'],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', null, 'Task');

      expect(result).toBe(true);
    });

    it('should return false when issue type is not in the list', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
        includedIssueTypes: ['Bug', 'Task'],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', null, 'Story');

      expect(result).toBe(false);
    });

    it('should return false when issue types are specified but issueType is null', () => {
      const stats = {
        persons: basePersons,
        columns: [],
        swimlanes: [],
        includedIssueTypes: ['Bug', 'Task'],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-1', null, null);

      expect(result).toBe(false);
    });
  });

  describe('combined criteria', () => {
    it('should return true when all criteria match', () => {
      const stats = {
        persons: basePersons,
        columns: [{ id: 'col-2', name: 'In Progress' }],
        swimlanes: [{ id: 'sw-1', name: 'Sprint 1' }],
        includedIssueTypes: ['Task'],
      };

      const result = isPersonLimitAppliedToIssue(stats, 'John Doe', 'col-2', 'sw-1', 'Task');

      expect(result).toBe(true);
    });

    it('should return false when column does not match despite other criteria matching', () => {
      const stats = {
        persons: basePersons,
        columns: [{ id: 'col-2', name: 'In Progress' }],
        swimlanes: [{ id: 'sw-1', name: 'Sprint 1' }],
        includedIssueTypes: ['Task'],
      };

      const result = isPersonLimitAppliedToIssue(
        stats,
        'John Doe',
        'col-1', // Wrong column
        'sw-1',
        'Task'
      );

      expect(result).toBe(false);
    });
  });
});