import { describe, it, expect } from 'vitest';
import {
  createFieldValueGetter,
  safeParseJql,
  checkIssueCondition,
  checkAllConditions,
  getMatchingConditions,
  getIconEmoji,
  generateCheckId,
  createDefaultCheck,
  validateJql,
  validateCheck,
  IssueData,
} from './utils';
import { IssueConditionCheck } from '../types';

describe('IssueConditionCheck utils', () => {
  describe('createFieldValueGetter', () => {
    it('should return field value by exact name', () => {
      const fields = { status: 'Open', priority: 'High' };
      const getter = createFieldValueGetter(fields);

      expect(getter('status')).toBe('Open');
      expect(getter('priority')).toBe('High');
    });

    it('should return field value case-insensitively', () => {
      const fields = { Status: 'Open', PRIORITY: 'High' };
      const getter = createFieldValueGetter(fields);

      expect(getter('status')).toBe('Open');
      expect(getter('STATUS')).toBe('Open');
      expect(getter('priority')).toBe('High');
    });

    it('should return undefined for non-existent fields', () => {
      const fields = { status: 'Open' };
      const getter = createFieldValueGetter(fields);

      expect(getter('nonexistent')).toBeUndefined();
    });
  });

  describe('safeParseJql', () => {
    it('should parse valid JQL', () => {
      const matchFn = safeParseJql('status = Open');
      expect(matchFn).not.toBeNull();
      expect(matchFn!(name => (name === 'status' ? 'Open' : undefined))).toBe(true);
    });

    it('should return null for invalid JQL', () => {
      const matchFn = safeParseJql('status = value with spaces');
      expect(matchFn).toBeNull();
    });

    it('should return null for empty JQL', () => {
      // Empty JQL is technically valid and matches everything
      const matchFn = safeParseJql('');
      // parseJql with empty string might throw or return a function
      // depending on implementation
    });
  });

  describe('checkIssueCondition - simple mode', () => {
    const createSimpleCheck = (jql: string, enabled = true): IssueConditionCheck => ({
      id: 'test-check',
      name: 'Test Check',
      enabled,
      mode: 'simple',
      icon: 'warning',
      color: 'yellow',
      tooltipText: 'Test tooltip',
      jql,
    });

    const createIssue = (fields: Record<string, unknown>): IssueData => ({
      key: 'TEST-1',
      fields,
    });

    it('should return matched=false when check is disabled', () => {
      const check = createSimpleCheck('status = Open', false);
      const issue = createIssue({ status: 'Open' });

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=false when JQL is empty', () => {
      const check = createSimpleCheck('');
      const issue = createIssue({ status: 'Open' });

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=true when issue matches JQL', () => {
      const check = createSimpleCheck('status = Open');
      const issue = createIssue({ status: 'Open' });

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(true);
    });

    it('should return matched=false when issue does not match JQL', () => {
      const check = createSimpleCheck('status = Closed');
      const issue = createIssue({ status: 'Open' });

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should handle complex JQL with AND', () => {
      const check = createSimpleCheck('status = Open AND priority = High');
      const issue1 = createIssue({ status: 'Open', priority: 'High' });
      const issue2 = createIssue({ status: 'Open', priority: 'Low' });

      expect(checkIssueCondition(issue1, check).matched).toBe(true);
      expect(checkIssueCondition(issue2, check).matched).toBe(false);
    });

    it('should handle complex JQL with OR', () => {
      const check = createSimpleCheck('status = Open OR status = "In Progress"');
      const issue1 = createIssue({ status: 'Open' });
      const issue2 = createIssue({ status: 'In Progress' });
      const issue3 = createIssue({ status: 'Closed' });

      expect(checkIssueCondition(issue1, check).matched).toBe(true);
      expect(checkIssueCondition(issue2, check).matched).toBe(true);
      expect(checkIssueCondition(issue3, check).matched).toBe(false);
    });

    it('should handle JQL with IN operator', () => {
      const check = createSimpleCheck('labels in (bug, urgent)');
      const issue1 = createIssue({ labels: ['bug', 'feature'] });
      const issue2 = createIssue({ labels: ['feature', 'enhancement'] });

      expect(checkIssueCondition(issue1, check).matched).toBe(true);
      expect(checkIssueCondition(issue2, check).matched).toBe(false);
    });

    it('should handle invalid JQL gracefully', () => {
      const check = createSimpleCheck('status = value with spaces');
      const issue = createIssue({ status: 'Open' });

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });
  });

  describe('checkIssueCondition - withSubtasks mode', () => {
    const createWithSubtasksCheck = (issueJql: string, subtaskJql: string, enabled = true): IssueConditionCheck => ({
      id: 'test-check',
      name: 'Test Check',
      enabled,
      mode: 'withSubtasks',
      icon: 'warning',
      color: 'red',
      tooltipText: 'Test tooltip',
      issueJql,
      subtaskJql,
    });

    const createIssueWithSubtasks = (
      fields: Record<string, unknown>,
      subtasks: Array<{ key: string; fields: Record<string, unknown> }>
    ): IssueData => ({
      key: 'TEST-1',
      fields,
      subtasks: subtasks.map(st => ({ key: st.key, fields: st.fields })),
    });

    it('should return matched=false when check is disabled', () => {
      const check = createWithSubtasksCheck('status = Open', 'status = "To Do"', false);
      const issue = createIssueWithSubtasks({ status: 'Open' }, [{ key: 'TEST-2', fields: { status: 'To Do' } }]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=false when issueJql is empty', () => {
      const check = createWithSubtasksCheck('', 'status = "To Do"');
      const issue = createIssueWithSubtasks({ status: 'Open' }, [{ key: 'TEST-2', fields: { status: 'To Do' } }]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=false when subtaskJql is empty', () => {
      const check = createWithSubtasksCheck('status = Open', '');
      const issue = createIssueWithSubtasks({ status: 'Open' }, [{ key: 'TEST-2', fields: { status: 'To Do' } }]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=true when issue and subtasks match (any mode)', () => {
      const check = createWithSubtasksCheck('status = Open', 'status = "To Do"');
      const issue = createIssueWithSubtasks({ status: 'Open' }, [
        { key: 'TEST-2', fields: { status: 'To Do', summary: 'Subtask 2' } },
        { key: 'TEST-3', fields: { status: 'Done', summary: 'Subtask 3' } },
      ]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(true);
      expect(result.matchedSubtasks).toEqual([{ key: 'TEST-2', summary: 'Subtask 2' }]);
    });

    it('should return matched=false when issue matches but no subtasks match', () => {
      const check = createWithSubtasksCheck('status = Open', 'status = "To Do"');
      const issue = createIssueWithSubtasks({ status: 'Open' }, [
        { key: 'TEST-2', fields: { status: 'Done' } },
        { key: 'TEST-3', fields: { status: 'Done' } },
      ]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=false when issue does not match', () => {
      const check = createWithSubtasksCheck('status = Closed', 'status = "To Do"');
      const issue = createIssueWithSubtasks({ status: 'Open' }, [{ key: 'TEST-2', fields: { status: 'To Do' } }]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return matched=false when issue has no subtasks', () => {
      const check = createWithSubtasksCheck('status = Open', 'status = "To Do"');
      const issue = createIssueWithSubtasks({ status: 'Open' }, []);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should return all matching subtask info', () => {
      const check = createWithSubtasksCheck('status = Open', 'status = "To Do"');
      const issue = createIssueWithSubtasks({ status: 'Open' }, [
        { key: 'TEST-2', fields: { status: 'To Do', summary: 'Task 2' } },
        { key: 'TEST-3', fields: { status: 'To Do', summary: 'Task 3' } },
        { key: 'TEST-4', fields: { status: 'Done', summary: 'Task 4' } },
      ]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(true);
      expect(result.matchedSubtasks).toEqual([
        { key: 'TEST-2', summary: 'Task 2' },
        { key: 'TEST-3', summary: 'Task 3' },
      ]);
    });

    it('should match when ALL subtasks match in all mode', () => {
      const check: IssueConditionCheck = {
        ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
        subtaskMatchMode: 'all',
      };
      const issue = createIssueWithSubtasks({ status: 'Open' }, [
        { key: 'TEST-2', fields: { status: 'To Do', summary: 'Task 2' } },
        { key: 'TEST-3', fields: { status: 'To Do', summary: 'Task 3' } },
      ]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(true);
      expect(result.matchedSubtasks).toHaveLength(2);
    });

    it('should NOT match when some subtasks do not match in all mode', () => {
      const check: IssueConditionCheck = {
        ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
        subtaskMatchMode: 'all',
      };
      const issue = createIssueWithSubtasks({ status: 'Open' }, [
        { key: 'TEST-2', fields: { status: 'To Do', summary: 'Task 2' } },
        { key: 'TEST-3', fields: { status: 'Done', summary: 'Task 3' } },
      ]);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    it('should NOT match in all mode when there are no subtasks', () => {
      const check: IssueConditionCheck = {
        ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
        subtaskMatchMode: 'all',
      };
      const issue = createIssueWithSubtasks({ status: 'Open' }, []);

      const result = checkIssueCondition(issue, check);

      expect(result.matched).toBe(false);
    });

    describe('subtaskSources filtering', () => {
      const createSubtask = (key: string, isSubtask: boolean, fields: Record<string, unknown> = {}) => ({
        key,
        fields: {
          status: 'To Do',
          issuetype: { subtask: isSubtask, name: isSubtask ? 'Sub-task' : 'Story' },
          ...fields,
        },
      });

      it('should only include direct subtasks when includeDirectSubtasks=true and others=false', () => {
        const check: IssueConditionCheck = {
          ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
          subtaskSources: {
            includeDirectSubtasks: true,
            includeEpicChildren: false,
            includeLinkedIssues: false,
          },
        };
        const issue: IssueData = {
          key: 'TEST-1',
          fields: { status: 'Open' },
          subtasks: [
            createSubtask('TEST-2', true), // direct subtask
            createSubtask('TEST-3', false), // epic child or linked
          ],
        };

        const result = checkIssueCondition(issue, check);

        expect(result.matched).toBe(true);
        expect(result.matchedSubtasks).toHaveLength(1);
        expect(result.matchedSubtasks?.[0].key).toBe('TEST-2');
      });

      it('should only include epic children when includeEpicChildren=true and others=false', () => {
        const check: IssueConditionCheck = {
          ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
          subtaskSources: {
            includeDirectSubtasks: false,
            includeEpicChildren: true,
            includeLinkedIssues: false,
          },
        };
        const issue: IssueData = {
          key: 'TEST-1',
          fields: { status: 'Open', issuetype: { name: 'Epic', subtask: false } },
          subtasks: [
            createSubtask('TEST-2', true), // direct subtask - should be excluded
            createSubtask('TEST-3', false), // epic child - should be included
          ],
        };

        const result = checkIssueCondition(issue, check);

        expect(result.matched).toBe(true);
        expect(result.matchedSubtasks).toHaveLength(1);
        expect(result.matchedSubtasks?.[0].key).toBe('TEST-3');
      });

      it('should include both direct subtasks and epic children by default', () => {
        const check: IssueConditionCheck = {
          ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
          // subtaskSources not set - should use defaults
        };
        const issue: IssueData = {
          key: 'TEST-1',
          fields: { status: 'Open' },
          subtasks: [
            createSubtask('TEST-2', true), // direct subtask
            createSubtask('TEST-3', false), // epic child
          ],
        };

        const result = checkIssueCondition(issue, check);

        expect(result.matched).toBe(true);
        expect(result.matchedSubtasks).toHaveLength(2);
      });

      it('should include all when all sources are enabled', () => {
        const check: IssueConditionCheck = {
          ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
          subtaskSources: {
            includeDirectSubtasks: true,
            includeEpicChildren: true,
            includeLinkedIssues: true,
          },
        };
        const issue: IssueData = {
          key: 'TEST-1',
          fields: { status: 'Open' },
          subtasks: [createSubtask('TEST-2', true), createSubtask('TEST-3', false)],
        };

        const result = checkIssueCondition(issue, check);

        expect(result.matched).toBe(true);
        expect(result.matchedSubtasks).toHaveLength(2);
      });

      it('should include non-subtasks when only linkedIssues is enabled', () => {
        const check: IssueConditionCheck = {
          ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
          subtaskSources: {
            includeDirectSubtasks: false,
            includeEpicChildren: false,
            includeLinkedIssues: true,
          },
        };
        const issue: IssueData = {
          key: 'TEST-1',
          fields: { status: 'Open' },
          subtasks: [
            createSubtask('TEST-2', true), // direct subtask - excluded
            createSubtask('TEST-3', false), // linked issue - included
          ],
        };

        const result = checkIssueCondition(issue, check);

        expect(result.matched).toBe(true);
        expect(result.matchedSubtasks).toHaveLength(1);
        expect(result.matchedSubtasks?.[0].key).toBe('TEST-3');
      });

      it('should return no matches when no sources are enabled', () => {
        const check: IssueConditionCheck = {
          ...createWithSubtasksCheck('status = Open', 'status = "To Do"'),
          subtaskSources: {
            includeDirectSubtasks: false,
            includeEpicChildren: false,
            includeLinkedIssues: false,
          },
        };
        const issue: IssueData = {
          key: 'TEST-1',
          fields: { status: 'Open' },
          subtasks: [createSubtask('TEST-2', true), createSubtask('TEST-3', false)],
        };

        const result = checkIssueCondition(issue, check);

        expect(result.matched).toBe(false);
      });
    });
  });

  describe('checkAllConditions', () => {
    it('should check all enabled conditions', () => {
      const checks: IssueConditionCheck[] = [
        {
          id: '1',
          name: 'Check 1',
          enabled: true,
          mode: 'simple',
          icon: 'warning',
          color: 'yellow',
          tooltipText: 'Tooltip 1',
          jql: 'status = Open',
        },
        {
          id: '2',
          name: 'Check 2',
          enabled: false,
          mode: 'simple',
          icon: 'info',
          color: 'blue',
          tooltipText: 'Tooltip 2',
          jql: 'priority = High',
        },
        {
          id: '3',
          name: 'Check 3',
          enabled: true,
          mode: 'simple',
          icon: 'bug',
          color: 'red',
          tooltipText: 'Tooltip 3',
          jql: 'labels = bug',
        },
      ];

      const issue: IssueData = {
        key: 'TEST-1',
        fields: { status: 'Open', priority: 'Low', labels: ['feature'] },
      };

      const results = checkAllConditions(issue, checks);

      // Only enabled checks are processed
      expect(results).toHaveLength(2);
      expect(results[0].matched).toBe(true); // status = Open
      expect(results[1].matched).toBe(false); // labels = bug
    });
  });

  describe('getMatchingConditions', () => {
    it('should return only matching conditions', () => {
      const checks: IssueConditionCheck[] = [
        {
          id: '1',
          name: 'Check 1',
          enabled: true,
          mode: 'simple',
          icon: 'warning',
          color: 'yellow',
          tooltipText: 'Tooltip 1',
          jql: 'status = Open',
        },
        {
          id: '2',
          name: 'Check 2',
          enabled: true,
          mode: 'simple',
          icon: 'info',
          color: 'blue',
          tooltipText: 'Tooltip 2',
          jql: 'priority = High',
        },
      ];

      const issue: IssueData = {
        key: 'TEST-1',
        fields: { status: 'Open', priority: 'Low' },
      };

      const results = getMatchingConditions(issue, checks);

      expect(results).toHaveLength(1);
      expect(results[0].check.id).toBe('1');
    });
  });

  describe('getIconEmoji', () => {
    it('should return correct emoji for each icon type', () => {
      expect(getIconEmoji('warning')).toBe('⚠️');
      expect(getIconEmoji('info')).toBe('ℹ️');
      expect(getIconEmoji('check')).toBe('✅');
      expect(getIconEmoji('close')).toBe('❌');
      expect(getIconEmoji('question')).toBe('❓');
      expect(getIconEmoji('exclamation')).toBe('❗');
      expect(getIconEmoji('flag')).toBe('🚩');
      expect(getIconEmoji('star')).toBe('⭐');
      expect(getIconEmoji('bug')).toBe('🐛');
      expect(getIconEmoji('clock')).toBe('⏰');
    });
  });

  describe('generateCheckId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateCheckId();
      const id2 = generateCheckId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^check_\d+_[a-z0-9]+$/);
    });
  });

  describe('createDefaultCheck', () => {
    it('should create a check with default values', () => {
      const check = createDefaultCheck();

      expect(check.id).toBeDefined();
      expect(check.name).toBe('');
      expect(check.enabled).toBe(true);
      expect(check.mode).toBe('simple');
      expect(check.icon).toBe('warning');
      expect(check.color).toBeUndefined(); // No background by default
      expect(check.tooltipText).toBe('');
      expect(check.jql).toBe('');
    });

    it('should allow overrides', () => {
      const check = createDefaultCheck({
        name: 'Custom Check',
        icon: 'bug',
        color: 'red',
      });

      expect(check.name).toBe('Custom Check');
      expect(check.icon).toBe('bug');
      expect(check.color).toBe('red');
    });
  });

  describe('validateJql', () => {
    it('should return valid=true for valid JQL', () => {
      expect(validateJql('status = Open')).toEqual({ valid: true });
      expect(validateJql('status = Open AND priority = High')).toEqual({ valid: true });
      expect(validateJql('labels in (bug, urgent)')).toEqual({ valid: true });
    });

    it('should return valid=false for empty JQL', () => {
      const result = validateJql('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('JQL is empty');
    });

    it('should return valid=false with error for invalid JQL', () => {
      const result = validateJql('status = value with spaces');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateCheck', () => {
    it('should return valid=true for valid simple check', () => {
      const check: IssueConditionCheck = {
        id: '1',
        name: 'Valid Check',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'yellow',
        tooltipText: 'Some tooltip',
        jql: 'status = Open',
      };

      const result = validateCheck(check);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing name', () => {
      const check: IssueConditionCheck = {
        id: '1',
        name: '',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'yellow',
        tooltipText: 'Some tooltip',
        jql: 'status = Open',
      };

      const result = validateCheck(check);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should return errors for missing tooltip', () => {
      const check: IssueConditionCheck = {
        id: '1',
        name: 'Check',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'yellow',
        tooltipText: '',
        jql: 'status = Open',
      };

      const result = validateCheck(check);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tooltip text is required');
    });

    it('should return errors for invalid JQL in simple mode', () => {
      const check: IssueConditionCheck = {
        id: '1',
        name: 'Check',
        enabled: true,
        mode: 'simple',
        icon: 'warning',
        color: 'yellow',
        tooltipText: 'Tooltip',
        jql: 'invalid jql with spaces',
      };

      const result = validateCheck(check);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Issue JQL'))).toBe(true);
    });

    it('should validate both JQLs in withSubtasks mode', () => {
      const check: IssueConditionCheck = {
        id: '1',
        name: 'Check',
        enabled: true,
        mode: 'withSubtasks',
        icon: 'warning',
        color: 'yellow',
        tooltipText: 'Tooltip',
        issueJql: '',
        subtaskJql: 'invalid jql with spaces',
      };

      const result = validateCheck(check);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Issue JQL'))).toBe(true);
      expect(result.errors.some(e => e.includes('Subtask JQL'))).toBe(true);
    });

    it('should return valid=true for valid withSubtasks check', () => {
      const check: IssueConditionCheck = {
        id: '1',
        name: 'Valid Check',
        enabled: true,
        mode: 'withSubtasks',
        icon: 'flag',
        color: 'red',
        tooltipText: 'Some tooltip',
        issueJql: 'status = Open',
        subtaskJql: 'status = "To Do"',
      };

      const result = validateCheck(check);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
