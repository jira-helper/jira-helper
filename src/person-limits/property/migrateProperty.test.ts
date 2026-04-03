import { describe, it, expect } from 'vitest';
import { migratePersonLimit, migrateProperty } from './migrateProperty';
import type {
  PersonLimit,
  PersonLimit_2_29,
  PersonWipLimitsProperty,
  PersonWipLimitsProperty_2_29,
  PersonWipLimitsProperty_2_30,
} from './types';

describe('migratePersonLimit', () => {
  describe('PersonLimit_2_29 variations (without showAllPersonIssues)', () => {
    it('should add showAllPersonIssues=true to limit with all fields', () => {
      const limit: PersonLimit_2_29 = {
        id: 1,
        person: {
          name: 'john.doe',
          displayName: 'John Doe',
          self: '/rest/api/2/user?username=john.doe',
          avatar: 'https://jira.example.com/avatar/john.doe',
        },
        limit: 3,
        columns: [
          { id: 'col1', name: 'To Do' },
          { id: 'col2', name: 'In Progress' },
        ],
        swimlanes: [{ id: 'sw1', name: 'Swimlane 1' }],
        includedIssueTypes: ['Task', 'Bug'],
      };

      const result = migratePersonLimit(limit);

      expect(result.showAllPersonIssues).toBe(true);
      expect(result.id).toBe(1);
      expect(result.person.name).toBe('john.doe');
      expect(result.person.displayName).toBe('John Doe');
      expect(result.person.avatar).toBe('https://jira.example.com/avatar/john.doe');
      expect(result.columns).toEqual(limit.columns);
      expect(result.swimlanes).toEqual(limit.swimlanes);
      expect(result.includedIssueTypes).toEqual(['Task', 'Bug']);
    });

    it('should add showAllPersonIssues=true to limit with minimal fields', () => {
      const limit: PersonLimit_2_29 = {
        id: 2,
        person: { name: 'jane.doe', self: '' },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      const result = migratePersonLimit(limit);

      expect(result.showAllPersonIssues).toBe(true);
      expect(result.person.displayName).toBeUndefined();
      expect(result.person.avatar).toBeUndefined();
      expect(result.includedIssueTypes).toBeUndefined();
    });

    it('should add showAllPersonIssues=true to limit without deprecated fields', () => {
      const limit: PersonLimit_2_29 = {
        id: 3,
        person: { name: 'bob', self: '/rest/api/2/user?username=bob' },
        limit: 1,
        columns: [{ id: 'col1', name: 'Done' }],
        swimlanes: [],
        includedIssueTypes: [],
      };

      const result = migratePersonLimit(limit);

      expect(result.showAllPersonIssues).toBe(true);
      expect(result.includedIssueTypes).toEqual([]);
    });
  });

  describe('PersonLimit_2_30 variations (with showAllPersonIssues)', () => {
    it('should not overwrite showAllPersonIssues=true', () => {
      const limit: PersonLimit = {
        id: 1,
        person: { name: 'john.doe', self: '' },
        limit: 3,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
      };

      const result = migratePersonLimit(limit);

      expect(result.showAllPersonIssues).toBe(true);
    });

    it('should not overwrite showAllPersonIssues=false', () => {
      const limit: PersonLimit = {
        id: 1,
        person: { name: 'john.doe', self: '' },
        limit: 3,
        columns: [{ id: 'col1', name: 'In Progress' }],
        swimlanes: [],
        showAllPersonIssues: false,
      };

      const result = migratePersonLimit(limit);

      expect(result.showAllPersonIssues).toBe(false);
    });
  });
});

describe('migrateProperty', () => {
  it('should handle empty limits array', () => {
    const data: PersonWipLimitsProperty_2_29 = { limits: [] };

    const result = migrateProperty(data);

    expect(result.limits).toEqual([]);
  });

  it('should migrate all v2.29 limits', () => {
    const data: PersonWipLimitsProperty_2_29 = {
      limits: [
        {
          id: 1,
          person: { name: 'john.doe', displayName: 'John Doe', self: '', avatar: 'https://avatar/john' },
          limit: 3,
          columns: [{ id: 'col1', name: 'To Do' }],
          swimlanes: [],
          includedIssueTypes: ['Task'],
        },
        {
          id: 2,
          person: { name: 'jane.doe', self: '' },
          limit: 5,
          columns: [],
          swimlanes: [{ id: 'sw1', name: 'Sprint 1' }],
        },
      ],
    };

    const result = migrateProperty(data);

    expect(result.limits).toHaveLength(2);
    expect(result.limits[0].showAllPersonIssues).toBe(true);
    expect(result.limits[1].showAllPersonIssues).toBe(true);
    expect(result.limits[0].person.displayName).toBe('John Doe');
    expect(result.limits[1].person.displayName).toBeUndefined();
  });

  it('should not modify already-migrated v2.30 property', () => {
    const data: PersonWipLimitsProperty_2_30 = {
      limits: [
        {
          id: 1,
          person: { name: 'john.doe', self: '' },
          limit: 3,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: false,
        },
        {
          id: 2,
          person: { name: 'jane.doe', self: '' },
          limit: 5,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
        },
      ],
    };

    const result = migrateProperty(data);

    expect(result.limits[0].showAllPersonIssues).toBe(false);
    expect(result.limits[1].showAllPersonIssues).toBe(true);
  });

  it('should handle mixed array — some limits with showAllPersonIssues, some without', () => {
    const data = {
      limits: [
        {
          id: 1,
          person: { name: 'john.doe', self: '' },
          limit: 3,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: false,
        },
        {
          id: 2,
          person: { name: 'jane.doe', displayName: 'Jane Doe', self: '', avatar: 'https://avatar/jane' },
          limit: 5,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'sw1', name: 'Lane 1' }],
          includedIssueTypes: ['Bug'],
        },
      ],
    };

    const result = migrateProperty(data as PersonWipLimitsProperty_2_29);

    expect(result.limits[0].showAllPersonIssues).toBe(false);
    expect(result.limits[1].showAllPersonIssues).toBe(true);
  });

  it('should produce valid PersonWipLimitsProperty from all v2.29 variations', () => {
    const data: PersonWipLimitsProperty_2_29 = {
      limits: [
        {
          id: 1,
          person: { name: 'full.user', displayName: 'Full User', self: '/api/user', avatar: 'https://avatar' },
          limit: 2,
          columns: [
            { id: 'c1', name: 'Col 1' },
            { id: 'c2', name: 'Col 2' },
          ],
          swimlanes: [{ id: 's1', name: 'Lane 1' }],
          includedIssueTypes: ['Task', 'Story'],
        },
        {
          id: 2,
          person: { name: 'minimal.user', self: '' },
          limit: 1,
          columns: [],
          swimlanes: [],
        },
        {
          id: 3,
          person: { name: 'no-deprecated.user', self: '/api/user2' },
          limit: 10,
          columns: [],
          swimlanes: [],
          includedIssueTypes: [],
        },
      ],
    };

    const result: PersonWipLimitsProperty = migrateProperty(data);

    result.limits.forEach(limit => {
      expect(limit).toHaveProperty('showAllPersonIssues');
      expect(limit.showAllPersonIssues).toBe(true);
      expect(limit).toHaveProperty('id');
      expect(limit).toHaveProperty('person');
      expect(limit).toHaveProperty('limit');
      expect(limit).toHaveProperty('columns');
      expect(limit).toHaveProperty('swimlanes');
    });
  });
});
