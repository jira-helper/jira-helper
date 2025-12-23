import { describe, it, expect } from 'vitest';
import { JiraIssueMapped, JiraField } from 'src/shared/jira/types';
import { JiraTestDataBuilder } from 'src/shared/jira/testData';
import { getFieldValueForJqlStandalone } from './useSubtasksProgress';

describe('getFieldValueForJqlStandalone', () => {
  const createMockIssue = (fields?: Record<string, any>): JiraIssueMapped => {
    const issue = new JiraTestDataBuilder().key('TEST-123').build();
    return {
      ...issue,
      fields: {
        ...issue.fields,
        ...fields,
      },
    };
  };

  describe('Field lookup', () => {
    it('should find field by id (case-insensitive)', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'Test Value' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['cf[10001]'],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('customfield_10001')).toEqual(['Test Value']);
      expect(getValue('CUSTOMFIELD_10001')).toEqual(['Test Value']);
      expect(getValue('CustomField_10001')).toEqual(['Test Value']);
    });

    it('should find field by name (case-insensitive)', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'Test Value' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Custom Field')).toEqual(['Test Value']);
      expect(getValue('custom field')).toEqual(['Test Value']);
      expect(getValue('CUSTOM FIELD')).toEqual(['Test Value']);
    });

    it('should find field by clauseNames (case-insensitive)', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'Test Value' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['cf[10001]', 'CustomField'],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('cf[10001]')).toEqual(['Test Value']);
      expect(getValue('CF[10001]')).toEqual(['Test Value']);
      expect(getValue('CustomField')).toEqual(['Test Value']);
      expect(getValue('customfield')).toEqual(['Test Value']);
    });

    it('should return empty array when field is not found', () => {
      const issue = createMockIssue();
      const fields: JiraField[] = [];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('nonexistent')).toEqual([]);
    });

    it('should handle multiple fields with same name', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'Value 1' },
        customfield_10002: { value: 'Value 2' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Project',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'option' },
        },
        {
          id: 'customfield_10002',
          name: 'Project',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'string' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      const result = getValue('Project');
      // Should return values from both fields
      expect(result).toContain('Value 1');
      expect(result).toContain('Value 2');
      expect(result.length).toBe(2);
    });
  });

  describe('Field value extraction by type', () => {
    it('should extract value for string type field', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'String Value' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'String Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'string' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('String Field')).toEqual(['String Value']);
    });

    it('should extract value for option type field', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'Option Value' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Option Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Option Field')).toEqual(['Option Value']);
    });

    it('should extract key for project type field', () => {
      const issue = createMockIssue({
        project: { key: 'TEST' },
      });

      const fields: JiraField[] = [
        {
          id: 'project',
          name: 'Project',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['project'],
          schema: { type: 'project' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('project')).toEqual(['TEST']);
    });

    it('should extract name for priority type field', () => {
      const issue = createMockIssue({
        priority: { name: 'High' },
      });

      const fields: JiraField[] = [
        {
          id: 'priority',
          name: 'Priority',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['priority'],
          schema: { type: 'priority' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('priority')).toEqual(['High']);
    });

    it('should extract name for status type field', () => {
      const issue = createMockIssue({
        status: { name: 'In Progress' },
      });

      const fields: JiraField[] = [
        {
          id: 'status',
          name: 'Status',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['status'],
          schema: { type: 'status' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('status')).toEqual(['In Progress']);
    });

    it('should extract name for issuetype field', () => {
      const issue = createMockIssue({
        issuetype: { name: 'Task' },
      });

      const fields: JiraField[] = [
        {
          id: 'issuetype',
          name: 'Issue Type',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['issuetype', 'type'],
          schema: { type: 'issuetype' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('issuetype')).toEqual(['Task']);
    });

    it('should extract multiple values for user type field', () => {
      const issue = createMockIssue({
        assignee: {
          displayName: 'John Doe',
          emailAddress: 'john.doe@example.com',
          name: 'jdoe',
        },
      });

      const fields: JiraField[] = [
        {
          id: 'assignee',
          name: 'Assignee',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['assignee'],
          schema: { type: 'user' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      const result = getValue('assignee');
      expect(result).toContain('John Doe');
      expect(result).toContain('john.doe@example.com');
      expect(result).toContain('jdoe');
      expect(result.length).toBe(3);
    });

    it('should extract values for array type field with component items', () => {
      const issue = createMockIssue({
        components: [{ name: 'Component 1' }, { name: 'Component 2' }],
      });

      const fields: JiraField[] = [
        {
          id: 'components',
          name: 'Components',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['component'],
          schema: { type: 'array', items: 'component' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('components')).toEqual(['Component 1', 'Component 2']);
    });

    it('should extract values for array type field with string items', () => {
      const issue = createMockIssue({
        customfield_10001: [{ value: 'Value 1' }, { value: 'Value 2' }],
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Multi Select',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'array', items: 'string' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Multi Select')).toEqual(['Value 1', 'Value 2']);
    });

    it('should extract values for array type field with option items', () => {
      const issue = createMockIssue({
        customfield_10001: [{ value: 'Option 1' }, { value: 'Option 2' }],
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Multi Option',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'array', items: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Multi Option')).toEqual(['Option 1', 'Option 2']);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array when field value is undefined', () => {
      const issue = createMockIssue({
        customfield_10001: undefined,
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Custom Field')).toEqual([]);
    });

    it('should return empty array when field value is null', () => {
      const issue = createMockIssue({
        customfield_10001: null,
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Custom Field')).toEqual([]);
    });

    it('should return empty array when option field value has no value property', () => {
      const issue = createMockIssue({
        customfield_10001: {},
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'option' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Custom Field')).toEqual([]);
    });

    it('should return empty array when project field has no key property', () => {
      const issue = createMockIssue({
        project: {},
      });

      const fields: JiraField[] = [
        {
          id: 'project',
          name: 'Project',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['project'],
          schema: { type: 'project' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('project')).toEqual([]);
    });

    it('should return empty array when priority field has no name property', () => {
      const issue = createMockIssue({
        priority: {},
      });

      const fields: JiraField[] = [
        {
          id: 'priority',
          name: 'Priority',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['priority'],
          schema: { type: 'priority' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('priority')).toEqual([]);
    });

    it('should return empty array when array field is empty', () => {
      const issue = createMockIssue({
        components: [],
      });

      const fields: JiraField[] = [
        {
          id: 'components',
          name: 'Components',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['component'],
          schema: { type: 'array', items: 'component' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('components')).toEqual([]);
    });

    it('should return empty array when array field is null', () => {
      const issue = createMockIssue({
        components: null,
      });

      const fields: JiraField[] = [
        {
          id: 'components',
          name: 'Components',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['component'],
          schema: { type: 'array', items: 'component' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('components')).toEqual([]);
    });

    it('should handle user field with partial data', () => {
      const issue = createMockIssue({
        assignee: {
          displayName: 'John Doe',
          // emailAddress and name are missing
        },
      });

      const fields: JiraField[] = [
        {
          id: 'assignee',
          name: 'Assignee',
          custom: false,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: ['assignee'],
          schema: { type: 'user' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('assignee')).toEqual(['John Doe']);
    });

    it('should handle field without schema', () => {
      const issue = createMockIssue({
        customfield_10001: { value: 'Test' },
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          // schema is undefined
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Custom Field')).toEqual([]);
    });

    it('should handle array field with unknown items type', () => {
      const issue = createMockIssue({
        customfield_10001: [{ value: 'Test' }],
      });

      const fields: JiraField[] = [
        {
          id: 'customfield_10001',
          name: 'Custom Field',
          custom: true,
          orderable: true,
          navigable: true,
          searchable: true,
          clauseNames: [],
          schema: { type: 'array', items: 'unknown' },
        },
      ];

      const getValue = getFieldValueForJqlStandalone(issue, fields);
      expect(getValue('Custom Field')).toEqual([]);
    });
  });
});
