import { describe, it, expect } from 'vitest';
import type { GanttScopeSettings } from '../types';
import { computeBars, matchColorRule, type GanttIssueInput } from './computeBars';

function scopeSettings(overrides: Partial<GanttScopeSettings> = {}): GanttScopeSettings {
  return {
    startMappings: [{ source: 'dateField', fieldId: 'customfield_start' }],
    endMappings: [{ source: 'dateField', fieldId: 'customfield_end' }],
    colorRules: [],
    tooltipFieldIds: [],
    exclusionFilters: [],
    quickFilters: [],
    includeSubtasks: true,
    includeEpicChildren: false,
    includeIssueLinks: false,
    issueLinkTypesToInclude: [],
    ...overrides,
  };
}

function baseIssue(overrides: Partial<GanttIssueInput> = {}): GanttIssueInput {
  return {
    id: '10001',
    key: 'PROJ-1',
    fields: {
      summary: 'Test issue',
      status: {
        name: 'In Progress',
        statusCategory: { key: 'indeterminate', colorName: 'yellow' },
      },
      customfield_start: '2024-06-01',
      customfield_end: '2024-06-10',
    },
    ...overrides,
  };
}

describe('computeBars', () => {
  const now = new Date('2025-03-15T12:00:00.000Z');

  it('produces a bar when both date fields resolve', () => {
    const settings = scopeSettings();
    const issue = baseIssue();
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(missingDateIssues).toEqual([]);
    expect(bars).toHaveLength(1);
    expect(bars[0]).toMatchObject({
      issueKey: 'PROJ-1',
      issueId: '10001',
      label: 'PROJ-1: Test issue',
      isOpenEnded: false,
      statusCategory: 'inProgress',
    });
    expect(bars[0].barColor).toBeUndefined();
    expect(bars[0].startDate.toISOString()).toBe(new Date('2024-06-01').toISOString());
    expect(bars[0].endDate.toISOString()).toBe(new Date('2024-06-10').toISOString());
    expect(bars[0].statusSections).toEqual([
      {
        statusName: 'In Progress',
        category: 'inProgress',
        startDate: bars[0].startDate,
        endDate: bars[0].endDate,
      },
    ]);
  });

  it('uses open-ended end (now) when start exists but end mapping is empty', () => {
    const settings = scopeSettings();
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        customfield_end: null,
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(missingDateIssues).toEqual([]);
    expect(bars).toHaveLength(1);
    expect(bars[0].isOpenEnded).toBe(true);
    expect(bars[0].endDate.getTime()).toBe(now.getTime());
    expect(bars[0].statusSections[0].endDate.getTime()).toBe(now.getTime());
  });

  it('records missing when neither start nor end resolve', () => {
    const settings = scopeSettings();
    const issue = baseIssue({
      fields: {
        summary: 'No dates',
        status: { name: 'Open', statusCategory: { key: 'new', colorName: 'blue-gray' } },
        customfield_start: null,
        customfield_end: null,
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(bars).toEqual([]);
    expect(missingDateIssues).toEqual([{ issueKey: 'PROJ-1', summary: 'No dates', reason: 'noStartAndEndDate' }]);
  });

  it('records missing when end exists but start does not', () => {
    const settings = scopeSettings();
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        customfield_start: null,
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(bars).toEqual([]);
    expect(missingDateIssues).toEqual([{ issueKey: 'PROJ-1', summary: 'Test issue', reason: 'noStartDate' }]);
  });

  it('excludes issues when exclusionFilters mode is field and value matches', () => {
    const settings = scopeSettings({
      exclusionFilters: [{ mode: 'field', fieldId: 'customfield_skip', value: 'yes' }],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        customfield_skip: 'yes',
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(bars).toEqual([]);
    expect(missingDateIssues).toEqual([{ issueKey: 'PROJ-1', summary: 'Test issue', reason: 'excluded' }]);
  });

  it('excludes issues when exclusionFilters mode is jql and JQL matches (e.g. status = Done)', () => {
    const settings = scopeSettings({
      exclusionFilters: [{ mode: 'jql', jql: 'status = Done' }],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        status: { name: 'Done', statusCategory: { key: 'done', colorName: 'green' } },
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(bars).toEqual([]);
    expect(missingDateIssues).toEqual([{ issueKey: 'PROJ-1', summary: 'Test issue', reason: 'excluded' }]);
  });

  it('does not exclude when exclusionFilters JQL is invalid (graceful fallback)', () => {
    const settings = scopeSettings({
      exclusionFilters: [{ mode: 'jql', jql: 'this is not valid jql !!!' }],
    });
    const issue = baseIssue();
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(missingDateIssues).toEqual([]);
    expect(bars).toHaveLength(1);
  });

  it('excludes issues matching ANY of multiple exclusionFilters (OR logic)', () => {
    const settings = scopeSettings({
      exclusionFilters: [
        { mode: 'field', fieldId: 'priority', value: 'Trivial' },
        { mode: 'field', fieldId: 'status', value: 'Cancelled' },
      ],
    });
    const trivialIssue = baseIssue({
      fields: { ...baseIssue().fields, priority: { name: 'Trivial' } },
    });
    const cancelledIssue = baseIssue({
      key: 'TEST-2',
      id: '2',
      fields: {
        ...baseIssue().fields,
        status: { name: 'Cancelled', statusCategory: { key: 'done' } },
      },
    });
    const normalIssue = baseIssue({
      key: 'TEST-3',
      id: '3',
      fields: { ...baseIssue().fields, priority: { name: 'High' } },
    });
    const result = computeBars([trivialIssue, cancelledIssue, normalIssue], settings, now);
    expect(result.bars).toHaveLength(1);
    expect(result.bars[0]!.issueKey).toBe('TEST-3');
    expect(result.missingDateIssues).toHaveLength(2);
  });

  // `hideCompletedTasks` was migrated to a built-in quick filter (`builtin:hideCompleted`).
  // computeBars no longer reads that field — quick filters are applied at the presentation layer
  // (see `applyQuickFiltersToBars`).

  it('resolves dates from first changelog transition to configured status', () => {
    const settings = scopeSettings({
      startMappings: [{ source: 'statusTransition', statusName: 'In Progress' }],
      endMappings: [{ source: 'statusTransition', statusName: 'Done' }],
    });
    const issue = baseIssue({
      fields: {
        summary: 'Changelog issue',
        status: { name: 'Done', statusCategory: { key: 'done', colorName: 'green' } },
      },
      changelog: {
        histories: [
          {
            created: '2024-01-05T10:00:00.000Z',
            items: [{ field: 'status', fromString: 'Open', toString: 'In Progress' }],
          },
          {
            created: '2024-01-20T15:00:00.000Z',
            items: [{ field: 'status', fromString: 'In Progress', toString: 'Done' }],
          },
        ],
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);

    expect(missingDateIssues).toEqual([]);
    expect(bars).toHaveLength(1);
    expect(bars[0].startDate.toISOString()).toBe('2024-01-05T10:00:00.000Z');
    expect(bars[0].endDate.toISOString()).toBe('2024-01-20T15:00:00.000Z');
    expect(bars[0].statusCategory).toBe('done');
  });

  it('label is always issue key and summary and tooltipFields follow tooltipFieldIds', () => {
    const settings = scopeSettings({
      tooltipFieldIds: ['assignee', 'priority'],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        summary: 'My summary',
        assignee: { displayName: 'Jane Doe' },
        priority: { name: 'High' },
      },
    });
    const { bars } = computeBars([issue], settings, now);

    expect(bars[0].label).toBe('PROJ-1: My summary');
    expect(bars[0].tooltipFields).toEqual({
      assignee: 'Jane Doe',
      priority: 'High',
    });
  });

  it('matchColorRule returns the first matching field rule color', () => {
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        priority: { name: 'High' },
      },
    });
    const rules = [
      { selector: { mode: 'field' as const, fieldId: 'priority', value: 'Low' }, color: '#111111' },
      { selector: { mode: 'field' as const, fieldId: 'priority', value: 'High' }, color: '#FF5630' },
      { selector: { mode: 'field' as const, fieldId: 'priority', value: 'High' }, color: '#222222' },
    ];
    expect(matchColorRule(issue, rules)).toBe('#FF5630');
  });

  it('matchColorRule applies jql selector (e.g. priority = Critical)', () => {
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        priority: { name: 'Critical' },
      },
    });
    const rules = [{ selector: { mode: 'jql' as const, jql: 'priority = Critical' }, color: '#FF5630' }];
    expect(matchColorRule(issue, rules)).toBe('#FF5630');
  });

  it('matchColorRule ignores invalid JQL and falls through without throwing', () => {
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        priority: { name: 'Critical' },
      },
    });
    const rules = [
      { selector: { mode: 'jql' as const, jql: 'totally broken ((( jql' }, color: '#111111' },
      { selector: { mode: 'field' as const, fieldId: 'priority', value: 'Critical' }, color: '#222222' },
    ];
    expect(matchColorRule(issue, rules)).toBe('#222222');
  });

  it('sets barColor from first matching color rule in computeBars', () => {
    const settings = scopeSettings({
      colorRules: [
        { selector: { mode: 'field', fieldId: 'customfield_flag', value: 'yes' }, color: '#111111' },
        { selector: { mode: 'field', fieldId: 'customfield_flag', value: 'no' }, color: '#36B37E' },
      ],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        customfield_flag: 'no',
      },
    });
    const { bars } = computeBars([issue], settings, now);
    expect(bars[0].barColor).toBe('#36B37E');
  });

  it('sets barColor when rule matches Jira priority object (name)', () => {
    const settings = scopeSettings({
      colorRules: [{ selector: { mode: 'field', fieldId: 'priority', value: 'Critical' }, color: '#FF5630' }],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        priority: { name: 'Critical' },
      },
    });
    const { bars } = computeBars([issue], settings, now);
    expect(bars[0].barColor).toBe('#FF5630');
  });

  // A1: composite Jira values (project, assignee, status, priority...) must be matchable
  // by any of their tokens (key/name/id/value/displayName/emailAddress) in BOTH JQL and field mode.
  it('JQL color rule matches project by key (e.g. project = TRPA)', () => {
    const settings = scopeSettings({
      colorRules: [{ selector: { mode: 'jql', jql: 'project = TRPA' }, color: '#FF5630' }],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        project: { key: 'TRPA', name: 'TR Project A', id: '10001' },
      },
    });
    const { bars } = computeBars([issue], settings, now);
    expect(bars[0].barColor).toBe('#FF5630');
  });

  it('JQL color rule matches project by name and by id as well', () => {
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        project: { key: 'TRPA', name: 'TR Project A', id: '10001' },
      },
    });
    expect(matchColorRule(issue, [{ selector: { mode: 'jql', jql: 'project = "TR Project A"' }, color: '#1' }])).toBe(
      '#1'
    );
    expect(matchColorRule(issue, [{ selector: { mode: 'jql', jql: 'project = 10001' }, color: '#2' }])).toBe('#2');
  });

  it('JQL color rule matches assignee by name OR displayName OR emailAddress', () => {
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        assignee: { name: 'jdoe', displayName: 'John Doe', emailAddress: 'jdoe@example.com', key: 'jdoe' },
      },
    });
    expect(matchColorRule(issue, [{ selector: { mode: 'jql', jql: 'assignee = jdoe' }, color: '#1' }])).toBe('#1');
    expect(matchColorRule(issue, [{ selector: { mode: 'jql', jql: 'assignee = "John Doe"' }, color: '#2' }])).toBe(
      '#2'
    );
    expect(
      matchColorRule(issue, [{ selector: { mode: 'jql', jql: 'assignee = jdoe@example.com' }, color: '#3' }])
    ).toBe('#3');
  });

  it('field-mode color rule matches project by key (e.g. fieldId=project, value=TRPA)', () => {
    const settings = scopeSettings({
      colorRules: [{ selector: { mode: 'field', fieldId: 'project', value: 'TRPA' }, color: '#36B37E' }],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        project: { key: 'TRPA', name: 'TR Project A', id: '10001' },
      },
    });
    const { bars } = computeBars([issue], settings, now);
    expect(bars[0].barColor).toBe('#36B37E');
  });

  it('field-mode exclusion filter matches assignee by displayName', () => {
    const settings = scopeSettings({
      exclusionFilters: [{ mode: 'field', fieldId: 'assignee', value: 'John Doe' }],
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        assignee: { name: 'jdoe', displayName: 'John Doe' },
      },
    });
    const { bars, missingDateIssues } = computeBars([issue], settings, now);
    expect(bars).toEqual([]);
    expect(missingDateIssues).toEqual([{ issueKey: 'PROJ-1', summary: 'Test issue', reason: 'excluded' }]);
  });

  it('with rootIssueKey: omits subtasks when includeSubtasks is false', () => {
    const settings = scopeSettings({
      includeSubtasks: false,
      includeEpicChildren: true,
      includeIssueLinks: true,
    });
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        parent: { key: 'ROOT-1' },
      },
    });
    const { bars } = computeBars([issue], settings, now, 'ROOT-1');
    expect(bars).toHaveLength(0);
  });

  it('with rootIssueKey: omits issues linked via issuelinks when includeIssueLinks is false', () => {
    const settings = scopeSettings({
      includeSubtasks: true,
      includeEpicChildren: false,
      includeIssueLinks: false,
    });
    const issue = baseIssue({
      key: 'LINK-1',
      fields: {
        ...baseIssue().fields,
        issuelinks: [{ type: { id: '10000' }, outwardIssue: { key: 'ROOT-1' } }],
      },
    });
    delete (issue.fields as Record<string, unknown>).parent;
    const { bars } = computeBars([issue], settings, now, 'ROOT-1');
    expect(bars).toHaveLength(0);
  });

  it('with rootIssueKey: omits epic children when includeEpicChildren is false', () => {
    const settings = scopeSettings({
      includeSubtasks: false,
      includeEpicChildren: false,
      includeIssueLinks: true,
    });
    const issue = baseIssue({
      key: 'EPIC-1',
      fields: {
        ...baseIssue().fields,
        customfield_10001: 'ROOT-1',
      },
    });
    delete (issue.fields as Record<string, unknown>).parent;
    const { bars } = computeBars([issue], settings, now, 'ROOT-1');
    expect(bars).toHaveLength(0);
  });

  it('with rootIssueKey: when issueLinkTypesToInclude is set, keeps only issues whose link matches type+direction', () => {
    const settings = scopeSettings({
      includeSubtasks: false,
      includeEpicChildren: false,
      includeIssueLinks: true,
      issueLinkTypesToInclude: [{ id: '10000', direction: 'inward' }],
    });
    const matchingInward = baseIssue({
      key: 'L-MATCH-IN',
      fields: {
        ...baseIssue().fields,
        issuelinks: [{ type: { id: '10000' }, inwardIssue: { key: 'ROOT-1' } }],
      },
    });
    delete (matchingInward.fields as Record<string, unknown>).parent;
    const wrongDirection = baseIssue({
      key: 'L-OUT',
      fields: {
        ...baseIssue().fields,
        issuelinks: [{ type: { id: '10000' }, outwardIssue: { key: 'ROOT-1' } }],
      },
    });
    delete (wrongDirection.fields as Record<string, unknown>).parent;
    const wrongType = baseIssue({
      key: 'L-OTHER-TYPE',
      fields: {
        ...baseIssue().fields,
        issuelinks: [{ type: { id: '10999' }, inwardIssue: { key: 'ROOT-1' } }],
      },
    });
    delete (wrongType.fields as Record<string, unknown>).parent;

    const { bars } = computeBars([matchingInward, wrongDirection, wrongType], settings, now, 'ROOT-1');
    expect(bars.map(b => b.issueKey)).toEqual(['L-MATCH-IN']);
  });

  it('with rootIssueKey: empty issueLinkTypesToInclude means no restriction', () => {
    const settings = scopeSettings({
      includeSubtasks: false,
      includeEpicChildren: false,
      includeIssueLinks: true,
      issueLinkTypesToInclude: [],
    });
    const link = baseIssue({
      key: 'L-1',
      fields: {
        ...baseIssue().fields,
        issuelinks: [{ type: { id: '10000' }, inwardIssue: { key: 'ROOT-1' } }],
      },
    });
    delete (link.fields as Record<string, unknown>).parent;
    const { bars } = computeBars([link], settings, now, 'ROOT-1');
    expect(bars.map(b => b.issueKey)).toEqual(['L-1']);
  });

  it('with rootIssueKey: includes subtask, epic child, and plain linked issue when all flags are true', () => {
    const settings = scopeSettings({
      includeSubtasks: true,
      includeEpicChildren: true,
      includeIssueLinks: true,
    });
    const sub = baseIssue({
      key: 'S-1',
      fields: { ...baseIssue().fields, parent: { key: 'ROOT-1' } },
    });
    const epic = baseIssue({
      key: 'E-1',
      fields: { ...baseIssue().fields, customfield_10001: 'ROOT-1' },
    });
    delete (epic.fields as Record<string, unknown>).parent;
    const link = baseIssue({
      key: 'L-1',
      fields: {
        ...baseIssue().fields,
        issuelinks: [{ type: { id: '10000' }, inwardIssue: { key: 'ROOT-1' } }],
      },
    });
    delete (link.fields as Record<string, unknown>).parent;
    const { bars } = computeBars([sub, epic, link], settings, now, 'ROOT-1');
    expect(bars.map(b => b.issueKey).sort()).toEqual(['E-1', 'L-1', 'S-1']);
  });

  it('defaults now to current time when omitted', () => {
    const settings = scopeSettings();
    const issue = baseIssue({
      fields: {
        ...baseIssue().fields,
        customfield_end: null,
      },
    });
    const before = Date.now();
    const { bars } = computeBars([issue], settings);
    const after = Date.now();

    expect(bars[0].isOpenEnded).toBe(true);
    expect(bars[0].endDate.getTime()).toBeGreaterThanOrEqual(before);
    expect(bars[0].endDate.getTime()).toBeLessThanOrEqual(after);
  });
});
