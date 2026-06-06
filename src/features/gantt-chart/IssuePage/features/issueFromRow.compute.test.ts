import { describe, it, expect } from 'vitest';
import { computeBars } from '../../utils/computeBars';
import type { GanttScopeSettings } from '../../types';
import { ganttDisplayBddCtx, issueFromRow } from './helpers';

describe('issueFromRow + computeBars (BDD-shaped rows)', () => {
  it('DISP-25: two missing-date issues and one bar', () => {
    ganttDisplayBddCtx.scenarioIssueKey = 'PROJ-2500';
    ganttDisplayBddCtx.scenarioProjectKey = 'PROJ';
    const rows: Record<string, string>[] = [
      {
        key: 'PROJ-2501',
        type: 'Story',
        relation: 'subtask',
        created: '2026-04-01',
        status: 'Done',
        statusCategory: 'done',
        dueDate: '2026-04-05',
        summary: 'Normal task',
      },
      {
        key: 'PROJ-2502',
        type: 'Story',
        relation: 'subtask',
        created: '-',
        status: 'In Progress',
        statusCategory: 'indeterminate',
        dueDate: '-',
        summary: 'No dates at all',
      },
      {
        key: 'PROJ-2503',
        type: 'Bug',
        relation: 'subtask',
        created: '-',
        status: 'To Do',
        statusCategory: 'new',
        dueDate: '2026-04-10',
        summary: 'No start date',
      },
    ];
    const issues = rows.map(r => issueFromRow(r));
    const settings: GanttScopeSettings = {
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
    };
    const now = new Date('2026-04-15T12:00:00.000Z');
    const { bars, missingDateIssues } = computeBars(issues, settings, now, 'PROJ-2500', []);
    expect(missingDateIssues).toHaveLength(2);
    expect(bars).toHaveLength(1);
  });

  it('DISP-25: fetch-style JSON clone preserves missing-date detection', () => {
    ganttDisplayBddCtx.scenarioIssueKey = 'PROJ-2500';
    ganttDisplayBddCtx.scenarioProjectKey = 'PROJ';
    const rows: Record<string, string>[] = [
      {
        key: 'PROJ-2501',
        type: 'Story',
        relation: 'subtask',
        created: '2026-04-01',
        status: 'Done',
        statusCategory: 'done',
        dueDate: '2026-04-05',
        summary: 'Normal task',
      },
      {
        key: 'PROJ-2502',
        type: 'Story',
        relation: 'subtask',
        created: '-',
        status: 'In Progress',
        statusCategory: 'indeterminate',
        dueDate: '-',
        summary: 'No dates at all',
      },
      {
        key: 'PROJ-2503',
        type: 'Bug',
        relation: 'subtask',
        created: '-',
        status: 'To Do',
        statusCategory: 'new',
        dueDate: '2026-04-10',
        summary: 'No start date',
      },
    ];
    const issues = rows.map(r => issueFromRow(r)).map(i => JSON.parse(JSON.stringify(i)));
    const settings: GanttScopeSettings = {
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
    };
    const now = new Date('2026-04-15T12:00:00.000Z');
    const { bars, missingDateIssues } = computeBars(issues, settings, now, 'PROJ-2500', []);
    expect(missingDateIssues).toHaveLength(2);
    expect(bars).toHaveLength(1);
  });
});
