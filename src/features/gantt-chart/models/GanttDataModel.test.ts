import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ok, Err } from 'ts-results';
import { proxy } from 'valtio';
import { Logger } from 'src/infrastructure/logging/Logger';
import type { IJiraService } from 'src/infrastructure/jira/jiraService';
import type { JiraIssueMapped } from 'src/infrastructure/jira/types';
import { JiraTestDataBuilder } from 'src/infrastructure/jira/testData';
import type { GanttScopeSettings } from '../types';
import { GanttDataModel } from './GanttDataModel';

function scopeSettings(overrides: Partial<GanttScopeSettings> = {}): GanttScopeSettings {
  return {
    startMappings: [{ source: 'dateField', fieldId: 'created' }],
    endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
    colorRules: [],
    tooltipFieldIds: [],
    exclusionFilters: [],
    hideCompletedTasks: false,
    includeSubtasks: true,
    includeEpicChildren: false,
    includeIssueLinks: false,
    issueLinkTypesToInclude: [],
    ...overrides,
  };
}

function datedIssue(): JiraIssueMapped {
  const issue = new JiraTestDataBuilder().key('ST-1').build();
  issue.fields.duedate = '2021-06-01';
  return issue;
}

describe('GanttDataModel', () => {
  let logger: Logger;
  let jiraService: IJiraService;
  let fetchSubtasks: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logger = new Logger();
    logger.setLevel('error');
    fetchSubtasks = vi.fn();
    jiraService = {
      fetchSubtasks,
      fetchJiraIssue: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn().mockResolvedValue(Ok([])),
      addWatcher: vi.fn().mockResolvedValue(Ok(undefined)),
    };
  });

  function createModel(getNow?: () => Date): GanttDataModel {
    return new GanttDataModel(jiraService, logger, getNow ?? (() => new Date('2021-03-15T12:00:00Z')));
  }

  it('initial state: initial loadingState, empty bars, no error', () => {
    const model = proxy(createModel());
    expect(model.loadingState).toBe('initial');
    expect(model.bars).toEqual([]);
    expect(model.missingDateIssues).toEqual([]);
    expect(model.error).toBeNull();
  });

  it('loadSubtasks success: initial → loading → loaded, computes bars', async () => {
    const issue = datedIssue();
    fetchSubtasks.mockResolvedValue(Ok({ subtasks: [issue], externalLinks: [] }));

    const model = proxy(createModel());
    const settings = scopeSettings();
    const p = model.loadSubtasks('ROOT-1', settings);

    expect(model.loadingState).toBe('loading');
    expect(model.error).toBeNull();

    await p;

    expect(fetchSubtasks).toHaveBeenCalledWith('ROOT-1', expect.any(AbortSignal));
    expect(model.loadingState).toBe('loaded');
    expect(model.error).toBeNull();
    expect(model.bars).toHaveLength(1);
    expect(model.bars[0].issueKey).toBe('ST-1');
    expect(model.missingDateIssues).toEqual([]);
  });

  it('loadSubtasks error: transitions to error and sets message', async () => {
    fetchSubtasks.mockResolvedValue(Err(new Error('Jira unavailable')));

    const model = proxy(createModel());
    await model.loadSubtasks('ROOT-1', scopeSettings());

    expect(model.loadingState).toBe('error');
    expect(model.error).toBe('Jira unavailable');
    expect(model.bars).toEqual([]);
  });

  it('loadSubtasks: superseded request does not overwrite state', async () => {
    const issueFast = datedIssue();
    issueFast.key = 'FAST-1';
    const issueSlow = datedIssue();
    issueSlow.key = 'SLOW-1';

    fetchSubtasks
      .mockImplementationOnce(async (_key, signal) => {
        await new Promise<void>(r => {
          setTimeout(r, 0);
        });
        if (signal.aborted) {
          return Err(new Error('Aborted by abort signal'));
        }
        return Ok({ subtasks: [issueSlow], externalLinks: [] });
      })
      .mockResolvedValueOnce(Ok({ subtasks: [issueFast], externalLinks: [] }));

    const model = proxy(createModel());
    const s = scopeSettings();
    const p1 = model.loadSubtasks('ROOT-1', s);
    await new Promise<void>(r => {
      setTimeout(r, 0);
    });
    const p2 = model.loadSubtasks('ROOT-2', s);
    await Promise.all([p1, p2]);

    expect(model.loadingState).toBe('loaded');
    expect(model.bars[0].issueKey).toBe('FAST-1');
  });

  it('loadSubtasks: excludes issues linked via issuelinks when includeIssueLinks is false', async () => {
    const issue = datedIssue();
    issue.key = 'LINK-1';
    delete (issue.fields as Record<string, unknown>).parent;
    const rootIssue = new JiraTestDataBuilder().key('ROOT-1').build();
    issue.fields.issuelinks = [
      {
        id: 'link-1',
        self: '',
        type: { id: '10000', name: 'Relates', inward: 'relates from', outward: 'relates to', self: '' },
        outwardIssue: {
          id: 'id-root',
          key: 'ROOT-1',
          self: '',
          fields: rootIssue.fields,
        } as unknown as JiraIssueMapped['fields']['issuelinks'][number]['outwardIssue'],
      },
    ];
    fetchSubtasks.mockResolvedValue(Ok({ subtasks: [issue], externalLinks: [] }));

    const model = proxy(createModel());
    await model.loadSubtasks(
      'ROOT-1',
      scopeSettings({ includeSubtasks: true, includeEpicChildren: false, includeIssueLinks: false })
    );

    expect(model.bars).toHaveLength(0);
    expect(model.missingDateIssues).toHaveLength(0);
  });

  it('recompute: updates bars from cache without calling fetchSubtasks', async () => {
    const issue = datedIssue();
    issue.fields.customfield_10001 = 'My label';
    fetchSubtasks.mockResolvedValue(Ok({ subtasks: [issue], externalLinks: [] }));

    const model = proxy(createModel());
    await model.loadSubtasks('ROOT-1', scopeSettings());
    expect(model.bars[0].label).toBe('ST-1: Test issue');
    expect(model.bars[0].barColor).toBeUndefined();
    fetchSubtasks.mockClear();

    model.recompute(
      scopeSettings({
        colorRules: [
          { selector: { mode: 'field', fieldId: 'customfield_10001', value: 'My label' }, color: '#FF5630' },
        ],
      })
    );

    expect(fetchSubtasks).not.toHaveBeenCalled();
    expect(model.bars[0].label).toBe('ST-1: Test issue');
    expect(model.bars[0].barColor).toBe('#FF5630');
  });

  it('recompute with no cached issues clears bars', () => {
    const model = proxy(createModel());
    model.recompute(scopeSettings());
    expect(model.bars).toEqual([]);
    expect(model.missingDateIssues).toEqual([]);
  });

  it('replaceCachedIssuesForTests: refreshes bars from a new in-memory snapshot', async () => {
    const a = datedIssue();
    fetchSubtasks.mockResolvedValue(Ok({ subtasks: [a], externalLinks: [] }));
    const model = proxy(createModel());
    await model.loadSubtasks('ROOT-1', scopeSettings());
    expect(model.bars).toHaveLength(1);

    const b = datedIssue();
    b.key = 'ST-2';
    b.id = 'id-2';
    b.fields.summary = 'Second';
    b.fields.parent = { key: 'ROOT-1', id: 'id-root' };
    model.replaceCachedIssuesForTests([a, b]);
    model.recompute(scopeSettings());

    expect(model.bars).toHaveLength(2);
    expect(model.bars.map(x => x.issueKey)).toContain('ST-2');
  });

  it('derives tasksWithoutStatusHistory from loaded bars and raw issue changelog', async () => {
    const noHistory = datedIssue();
    noHistory.key = 'NO-1';
    noHistory.fields.summary = 'No history task';

    const withHistory = datedIssue();
    withHistory.key = 'YES-1';
    withHistory.id = 'id-yes';
    withHistory.fields.summary = 'Has history task';
    withHistory.fields.parent = { key: 'ROOT-1', id: 'id-root' };
    withHistory.changelog = {
      histories: [
        {
          created: '2021-05-01T10:00:00.000Z',
          id: 'history-1',
          author: {
            self: '',
            name: 'tester',
            key: 'tester',
            emailAddress: 'tester@example.com',
            avatarUrls: { '48x48': '', '24x24': '', '16x16': '', '32x32': '' },
            displayName: 'Tester',
            active: true,
            timeZone: 'UTC',
          },
          items: [
            {
              field: 'status',
              fieldtype: 'jira',
              from: '',
              to: '',
              fromString: 'To Do',
              toString: 'In Progress',
            },
          ],
        },
      ],
      startAt: 0,
      total: 1,
      maxResults: 1,
    };
    fetchSubtasks.mockResolvedValue(Ok({ subtasks: [noHistory, withHistory], externalLinks: [] }));

    const model = proxy(createModel());
    await model.loadSubtasks('ROOT-1', scopeSettings());

    expect(model.tasksWithoutStatusHistory).toEqual([{ key: 'NO-1', summary: 'No history task' }]);
  });

  it('reset restores initial state and ignores stale load results', async () => {
    const issue = datedIssue();
    let finish!: () => void;
    const gate = new Promise<void>(r => {
      finish = r;
    });
    fetchSubtasks.mockImplementation(async () => {
      await gate;
      return Ok({ subtasks: [issue], externalLinks: [] });
    });

    const model = proxy(createModel());
    const p = model.loadSubtasks('ROOT-1', scopeSettings());
    model.reset();
    finish();
    await p;

    expect(model.loadingState).toBe('initial');
    expect(model.bars).toEqual([]);
    expect(model.error).toBeNull();
  });
});
