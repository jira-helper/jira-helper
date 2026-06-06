import { describe, expect, it } from 'vitest';
import type { JiraField } from 'src/infrastructure/jira/types';
import type { GanttBar, QuickFilter } from '../types';
import type { GanttIssueInput } from '../utils/computeBars';
import { BUILT_IN_QUICK_FILTERS, BUILT_IN_QUICK_FILTER_IDS } from './builtIns';
import { matchQuickFilter } from './matchQuickFilter';
import { applyQuickFiltersToBars } from './applyQuickFiltersToBars';

function issue(overrides: Partial<GanttIssueInput> = {}): GanttIssueInput {
  return {
    id: '1',
    key: 'PROJ-1',
    fields: {
      summary: 'A',
      status: { name: 'In Progress', statusCategory: { key: 'indeterminate' } },
      ...((overrides.fields as Record<string, unknown> | undefined) ?? {}),
    },
    ...overrides,
  };
}

function bar(overrides: Partial<GanttBar> = {}): GanttBar {
  return {
    issueKey: 'PROJ-1',
    issueId: '1',
    label: 'PROJ-1: Some summary',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-10'),
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

const unresolvedFilter = BUILT_IN_QUICK_FILTERS.find(f => f.id === BUILT_IN_QUICK_FILTER_IDS.unresolved)!;
const hideCompletedFilter = BUILT_IN_QUICK_FILTERS.find(f => f.id === BUILT_IN_QUICK_FILTER_IDS.hideCompleted)!;

describe('matchQuickFilter / built-ins', () => {
  it('Unresolved passes when resolution is null', () => {
    expect(matchQuickFilter(issue({ fields: { resolution: null } }), unresolvedFilter)).toBe(true);
  });

  it('Unresolved passes when resolution field is missing entirely', () => {
    expect(matchQuickFilter(issue(), unresolvedFilter)).toBe(true);
  });

  it('Unresolved fails when resolution is set (e.g. Done)', () => {
    expect(matchQuickFilter(issue({ fields: { resolution: { name: 'Done' } } }), unresolvedFilter)).toBe(false);
  });

  it('Hide completed passes when statusCategory is not done', () => {
    expect(
      matchQuickFilter(issue({ fields: { status: { statusCategory: { key: 'indeterminate' } } } }), hideCompletedFilter)
    ).toBe(true);
  });

  it('Hide completed fails when statusCategory is done', () => {
    expect(
      matchQuickFilter(issue({ fields: { status: { statusCategory: { key: 'done' } } } }), hideCompletedFilter)
    ).toBe(false);
  });
});

describe('matchQuickFilter / custom filters', () => {
  it('field-mode filter matches by token (project key)', () => {
    const f: QuickFilter = {
      id: 'c1',
      name: 'TRPA',
      selector: { mode: 'field', fieldId: 'project', value: 'TRPA' },
    };
    expect(matchQuickFilter(issue({ fields: { project: { key: 'TRPA', name: 'TR' } } }), f)).toBe(true);
    expect(matchQuickFilter(issue({ fields: { project: { key: 'OTHER' } } }), f)).toBe(false);
  });

  it('jql-mode filter matches via parseJql with composite values', () => {
    const f: QuickFilter = {
      id: 'c2',
      name: 'TRPA',
      selector: { mode: 'jql', jql: 'project = TRPA' },
    };
    expect(matchQuickFilter(issue({ fields: { project: { key: 'TRPA' } } }), f)).toBe(true);
  });

  it('invalid JQL passes everything (graceful fallback so chart does not silently empty)', () => {
    const f: QuickFilter = { id: 'c3', name: 'broken', selector: { mode: 'jql', jql: '((( broken' } };
    expect(matchQuickFilter(issue(), f)).toBe(true);
  });

  it('field-mode filter with missing value passes everything', () => {
    const f: QuickFilter = { id: 'c4', name: 'noop', selector: { mode: 'field', fieldId: 'priority' } };
    expect(matchQuickFilter(issue(), f)).toBe(true);
  });

  describe('Jira field metadata resolution (Platform=Backend regression)', () => {
    const platformField: JiraField = {
      id: 'customfield_178101',
      name: 'Platform',
      custom: true,
      orderable: true,
      navigable: true,
      searchable: true,
      clauseNames: ['cf[178101]', 'Platform'],
      schema: { type: 'array', items: 'option', custom: 'multiselect', customId: 178101 },
    };
    const issueWithPlatform = (values: string[]) =>
      issue({
        fields: { customfield_178101: values.map((value, i) => ({ value, id: String(100 + i) })) },
      });

    it('JQL `Platform = Backend` matches by custom-field display name when fields metadata is provided', () => {
      const f: QuickFilter = {
        id: 'c-platform',
        name: 'Backend',
        selector: { mode: 'jql', jql: 'Platform = Backend' },
      };
      expect(matchQuickFilter(issueWithPlatform(['Web', 'Backend']), f, [platformField])).toBe(true);
      expect(matchQuickFilter(issueWithPlatform(['Web']), f, [platformField])).toBe(false);
    });

    it('field-mode filter with display-name fieldId resolves through metadata', () => {
      const f: QuickFilter = {
        id: 'c-platform-field',
        name: 'Backend',
        selector: { mode: 'field', fieldId: 'Platform', value: 'Backend' },
      };
      expect(matchQuickFilter(issueWithPlatform(['Backend']), f, [platformField])).toBe(true);
      expect(matchQuickFilter(issueWithPlatform(['Web']), f, [platformField])).toBe(false);
    });

    it('without metadata, the same JQL matches no issues (this is the bug we are guarding against)', () => {
      const f: QuickFilter = {
        id: 'c-platform-no-meta',
        name: 'Backend',
        selector: { mode: 'jql', jql: 'Platform = Backend' },
      };
      // Sanity check: when fields metadata is absent we cannot resolve `Platform`,
      // so the filter hides the issue. This proves the wiring through `fields` is what fixes it.
      expect(matchQuickFilter(issueWithPlatform(['Backend']), f, [])).toBe(false);
    });

    it('regression: project/priority by display name still work via metadata', () => {
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
      const trpaHigh = issue({
        fields: { project: { key: 'TRPA', name: 'TR' }, priority: { name: 'High' } },
      });

      expect(
        matchQuickFilter(trpaHigh, { id: 'q', name: 'q', selector: { mode: 'jql', jql: 'project = TRPA' } }, fields)
      ).toBe(true);
      expect(
        matchQuickFilter(trpaHigh, { id: 'q', name: 'q', selector: { mode: 'jql', jql: 'priority = High' } }, fields)
      ).toBe(true);
    });
  });
});

describe('applyQuickFiltersToBars', () => {
  it('returns bars unchanged when no filters and no search', () => {
    const b1 = bar();
    const result = applyQuickFiltersToBars([b1], new Map(), [], { mode: 'text', value: '' });
    expect(result.bars).toEqual([b1]);
    expect(result.hiddenCount).toBe(0);
  });

  it('filters by case-insensitive substring on the bar label', () => {
    const result = applyQuickFiltersToBars(
      [bar({ label: 'PROJ-1: alpha' }), bar({ issueKey: 'PROJ-2', label: 'PROJ-2: beta' })],
      new Map(),
      [],
      { mode: 'text', value: 'BETA' }
    );
    expect(result.bars.map(b => b.issueKey)).toEqual(['PROJ-2']);
    expect(result.hiddenCount).toBe(1);
  });

  it('jql mode filters bars by parseJql + field resolution', () => {
    const highPri = issue({ key: 'A-1', fields: { priority: { name: 'High' } } });
    const lowPri = issue({ key: 'A-2', fields: { priority: { name: 'Low' } } });
    const issuesByKey = new Map<string, GanttIssueInput>([
      ['A-1', highPri],
      ['A-2', lowPri],
    ]);
    const bars = [bar({ issueKey: 'A-1', label: 'A-1: x' }), bar({ issueKey: 'A-2', label: 'A-2: y' })];
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
    const result = applyQuickFiltersToBars(bars, issuesByKey, [], { mode: 'jql', value: 'priority = High' }, fields);
    expect(result.bars.map(b => b.issueKey)).toEqual(['A-1']);
    expect(result.hiddenCount).toBe(1);
  });

  it('jql mode with invalid JQL passes all bars and does not count hidden', () => {
    const issuesByKey = new Map<string, GanttIssueInput>([
      ['A-1', issue({ key: 'A-1' })],
      ['A-2', issue({ key: 'A-2' })],
    ]);
    const bars = [bar({ issueKey: 'A-1' }), bar({ issueKey: 'A-2', issueId: '2' })];
    const result = applyQuickFiltersToBars(bars, issuesByKey, [], { mode: 'jql', value: '((( broken' });
    expect(result.bars).toHaveLength(2);
    expect(result.hiddenCount).toBe(0);
  });

  it('jql mode with empty or whitespace JQL does not filter', () => {
    const issuesByKey = new Map<string, GanttIssueInput>([['A-1', issue({ key: 'A-1' })]]);
    const b = bar({ issueKey: 'A-1' });
    expect(applyQuickFiltersToBars([b], issuesByKey, [], { mode: 'jql', value: '' }).hiddenCount).toBe(0);
    expect(applyQuickFiltersToBars([b], issuesByKey, [], { mode: 'jql', value: '   ' }).hiddenCount).toBe(0);
  });

  it('jql search resolves custom field by display name (Platform = Backend)', () => {
    const platformField: JiraField = {
      id: 'customfield_178101',
      name: 'Platform',
      custom: true,
      orderable: true,
      navigable: true,
      searchable: true,
      clauseNames: ['cf[178101]', 'Platform'],
      schema: { type: 'array', items: 'option', custom: 'multiselect', customId: 178101 },
    };
    const backend = issue({
      key: 'A-1',
      fields: { customfield_178101: [{ value: 'Backend', id: '1' }] },
    });
    const web = issue({
      key: 'A-2',
      fields: { customfield_178101: [{ value: 'Web', id: '2' }] },
    });
    const issuesByKey = new Map<string, GanttIssueInput>([
      ['A-1', backend],
      ['A-2', web],
    ]);
    const bars = [bar({ issueKey: 'A-1' }), bar({ issueKey: 'A-2', issueId: '2' })];
    const result = applyQuickFiltersToBars(bars, issuesByKey, [], { mode: 'jql', value: 'Platform = Backend' }, [
      platformField,
    ]);
    expect(result.bars.map(b => b.issueKey)).toEqual(['A-1']);
    expect(result.hiddenCount).toBe(1);
  });

  it('combines multiple active filters via AND (bar must pass every filter)', () => {
    const trpa: QuickFilter = {
      id: 'c1',
      name: 'TRPA',
      selector: { mode: 'field', fieldId: 'project', value: 'TRPA' },
    };
    const high: QuickFilter = {
      id: 'c2',
      name: 'High',
      selector: { mode: 'field', fieldId: 'priority', value: 'High' },
    };
    const issuesByKey = new Map<string, GanttIssueInput>([
      ['A-1', issue({ key: 'A-1', fields: { project: { key: 'TRPA' }, priority: { name: 'High' } } })],
      ['A-2', issue({ key: 'A-2', fields: { project: { key: 'TRPA' }, priority: { name: 'Low' } } })],
      ['A-3', issue({ key: 'A-3', fields: { project: { key: 'OTHER' }, priority: { name: 'High' } } })],
    ]);
    const bars = [
      bar({ issueKey: 'A-1', label: 'A-1: x' }),
      bar({ issueKey: 'A-2', label: 'A-2: y' }),
      bar({ issueKey: 'A-3', label: 'A-3: z' }),
    ];
    const result = applyQuickFiltersToBars(bars, issuesByKey, [trpa, high], { mode: 'text', value: '' });
    expect(result.bars.map(b => b.issueKey)).toEqual(['A-1']);
    expect(result.hiddenCount).toBe(2);
  });

  it('combines search and filters (search applied first; filters then narrow further)', () => {
    const hideCompleted = hideCompletedFilter;
    const issuesByKey = new Map<string, GanttIssueInput>([
      ['A-1', issue({ key: 'A-1', fields: { status: { statusCategory: { key: 'done' } } } })],
      ['A-2', issue({ key: 'A-2', fields: { status: { statusCategory: { key: 'indeterminate' } } } })],
      ['B-1', issue({ key: 'B-1', fields: { status: { statusCategory: { key: 'indeterminate' } } } })],
    ]);
    const bars = [
      bar({ issueKey: 'A-1', label: 'A-1: foo' }),
      bar({ issueKey: 'A-2', label: 'A-2: foo' }),
      bar({ issueKey: 'B-1', label: 'B-1: bar' }),
    ];
    const result = applyQuickFiltersToBars(bars, issuesByKey, [hideCompleted], { mode: 'text', value: 'foo' });
    expect(result.bars.map(b => b.issueKey)).toEqual(['A-2']);
    expect(result.hiddenCount).toBe(2);
  });
});
