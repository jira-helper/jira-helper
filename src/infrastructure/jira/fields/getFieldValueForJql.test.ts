import { describe, expect, it } from 'vitest';
import { JiraField } from '../types';
import { getFieldValueForJql } from './getFieldValueForJql';

const field = (overrides: Partial<JiraField> & Pick<JiraField, 'id' | 'name' | 'schema'>): JiraField => ({
  custom: false,
  orderable: true,
  navigable: true,
  searchable: true,
  clauseNames: [],
  ...overrides,
});

describe('getFieldValueForJql', () => {
  describe('schema-aware resolution by display name', () => {
    it('resolves a custom multi-select option array by its human name (Platform=Backend case)', () => {
      const issue = {
        fields: {
          customfield_178101: [
            { value: 'Web', id: '237664' },
            { value: 'Backend', id: '237665' },
          ],
        },
      };
      const fields: JiraField[] = [
        field({
          id: 'customfield_178101',
          name: 'Platform',
          custom: true,
          clauseNames: ['cf[178101]', 'Platform'],
          schema: { type: 'array', items: 'option', custom: 'multiselect', customId: 178101 },
        }),
      ];

      const get = getFieldValueForJql(issue, fields);

      expect(get('Platform')).toEqual(['Web', 'Backend']);
      expect(get('platform')).toEqual(['Web', 'Backend']);
      expect(get('cf[178101]')).toEqual(['Web', 'Backend']);
    });

    it('resolves project by key, priority/status by name, assignee by user-tokens', () => {
      const issue = {
        fields: {
          project: { key: 'TRPA', name: 'T-Travel' },
          priority: { name: 'High' },
          status: { name: 'In Progress' },
          assignee: { displayName: 'Jane Roe', emailAddress: 'jr@example.com', name: 'jroe' },
        },
      };
      const fields: JiraField[] = [
        field({ id: 'project', name: 'Project', clauseNames: ['project'], schema: { type: 'project' } }),
        field({ id: 'priority', name: 'Priority', clauseNames: ['priority'], schema: { type: 'priority' } }),
        field({ id: 'status', name: 'Status', clauseNames: ['status'], schema: { type: 'status' } }),
        field({ id: 'assignee', name: 'Assignee', clauseNames: ['assignee'], schema: { type: 'user' } }),
      ];
      const get = getFieldValueForJql(issue, fields);

      expect(get('project')).toEqual(['TRPA']);
      expect(get('priority')).toEqual(['High']);
      expect(get('status')).toEqual(['In Progress']);
      expect(get('assignee')).toEqual(['Jane Roe', 'jr@example.com', 'jroe']);
    });

    it('flattens tokens from multiple fields sharing the same display name', () => {
      const issue = {
        fields: {
          customfield_1: { value: 'A' },
          customfield_2: { value: 'B' },
        },
      };
      const fields: JiraField[] = [
        field({ id: 'customfield_1', name: 'Foo', schema: { type: 'option' } }),
        field({ id: 'customfield_2', name: 'Foo', schema: { type: 'option' } }),
      ];

      expect(getFieldValueForJql(issue, fields)('Foo')).toEqual(['A', 'B']);
    });
  });

  describe('fallback when field metadata is missing', () => {
    it('returns raw direct-lookup tokens when no JiraField matches (so loading state still works)', () => {
      const issue = {
        fields: {
          project: { key: 'TRPA', name: 'T-Travel' },
        },
      };
      const get = getFieldValueForJql(issue, []);
      // No metadata yet — fall back to direct tokens (key/name/id/value/displayName/emailAddress)
      expect(get('project')).toEqual(['TRPA', 'T-Travel']);
    });

    it('looks up `customfield_NNNNN` directly when not in metadata', () => {
      const issue = { fields: { customfield_999: 'literal-value' } };
      expect(getFieldValueForJql(issue, [])('customfield_999')).toEqual(['literal-value']);
    });

    it('returns [] when the field is unknown both in metadata and on the issue', () => {
      const issue = { fields: { project: { key: 'TRPA' } } };
      expect(getFieldValueForJql(issue, [])('Platform')).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('returns [] for null/undefined values', () => {
      const fields: JiraField[] = [field({ id: 'cf', name: 'Cf', schema: { type: 'option' } })];
      expect(getFieldValueForJql({ fields: { cf: null } }, fields)('Cf')).toEqual([]);
      expect(getFieldValueForJql({ fields: { cf: undefined } }, fields)('Cf')).toEqual([]);
    });

    it('returns [] for an array field that is missing or empty', () => {
      const fields: JiraField[] = [
        field({ id: 'components', name: 'Components', schema: { type: 'array', items: 'component' } }),
      ];
      expect(getFieldValueForJql({ fields: { components: [] } }, fields)('Components')).toEqual([]);
      expect(getFieldValueForJql({ fields: {} }, fields)('Components')).toEqual([]);
    });
  });
});
