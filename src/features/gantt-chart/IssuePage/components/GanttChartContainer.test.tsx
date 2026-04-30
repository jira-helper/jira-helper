import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ok, Err } from 'ts-results';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../models/GanttSettingsModel';
import { ganttChartModule } from '../../module';
import { ganttSettingsModelToken } from '../../tokens';
import type { GanttScopeSettings } from '../../types';
import { buildScopeKey } from '../../utils/resolveSettings';
import { JiraTestDataBuilder } from 'src/infrastructure/jira/testData';
import { GanttChartContainer } from './GanttChartContainer';
import { applyGanttSettingsTable, ganttDisplayBddCtx, issueFromRow } from '../features/helpers';
import { applyInitialGanttScopeForIssueView } from '../../utils/applyInitialGanttScopeForIssueView';

const EN_FIRST_RUN = 'Gantt chart is not configured yet. Please configure start and end date mappings.';
const EN_EMPTY =
  'No subtasks found for this issue. The Gantt chart requires subtasks, epic children, or linked issues.';
const EN_ERROR = 'Failed to load Gantt chart data. Please try refreshing the page.';

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

function registerMockJira(fetchSubtasks: IJiraService['fetchSubtasks']): void {
  const mock: IJiraService = {
    fetchSubtasks,
    fetchJiraIssue: vi.fn(),
    getExternalIssues: vi.fn(),
    getProjectFields: vi.fn(),
    getIssueLinkTypes: vi.fn(),
    getStatuses: vi.fn().mockResolvedValue(Ok([])),
    addWatcher: vi.fn().mockResolvedValue(Ok(undefined)),
  };
  globalContainer.register({ token: JiraServiceToken, value: mock });
}

describe('GanttChartContainer', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
    localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
  });

  it('shows FirstRunState when settings are not configured', () => {
    registerMockJira(vi.fn());
    ganttChartModule.ensure(globalContainer);
    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-1" container={globalContainer} />
      </WithDi>
    );

    expect(screen.getByText(EN_FIRST_RUN)).toBeInTheDocument();
  });

  it('shows loading while subtasks are being fetched', async () => {
    let release!: (value: Awaited<ReturnType<IJiraService['fetchSubtasks']>>) => void;
    const pending = new Promise<Awaited<ReturnType<IJiraService['fetchSubtasks']>>>(res => {
      release = res;
    });
    registerMockJira(vi.fn(() => pending));
    ganttChartModule.ensure(globalContainer);

    const scopeKey = buildScopeKey('PROJ');
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: { [scopeKey]: scopeSettings() },
        statusBreakdownEnabled: false,
      })
    );
    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();
    model.setScope({ level: 'project', projectKey: 'PROJ' });

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-1" container={globalContainer} />
      </WithDi>
    );

    expect(await screen.findByTestId('gantt-chart-loading')).toBeInTheDocument();

    release(Ok({ subtasks: [], externalLinks: [] }));
    await waitFor(() => {
      expect(screen.queryByTestId('gantt-chart-loading')).not.toBeInTheDocument();
    });
  });

  it('shows ErrorState with retry when load fails', async () => {
    const fetchSubtasks = vi.fn().mockResolvedValue(Err(new Error('network down')));
    registerMockJira(fetchSubtasks);
    ganttChartModule.ensure(globalContainer);

    const scopeKey = buildScopeKey('PROJ');
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: { [scopeKey]: scopeSettings() },
        statusBreakdownEnabled: false,
      })
    );
    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();
    model.setScope({ level: 'project', projectKey: 'PROJ' });

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-1" container={globalContainer} />
      </WithDi>
    );

    expect(await screen.findByText(EN_ERROR)).toBeInTheDocument();
    expect(screen.getByText('network down')).toBeInTheDocument();

    fetchSubtasks.mockResolvedValue(Ok({ subtasks: [], externalLinks: [] }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(fetchSubtasks).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getByText(EN_EMPTY)).toBeInTheDocument();
    });
  });

  it('shows EmptyState when load succeeds with no drawable work', async () => {
    registerMockJira(vi.fn().mockResolvedValue(Ok({ subtasks: [], externalLinks: [] })));
    ganttChartModule.ensure(globalContainer);

    const scopeKey = buildScopeKey('PROJ');
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: { [scopeKey]: scopeSettings() },
        statusBreakdownEnabled: false,
      })
    );
    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();
    model.setScope({ level: 'project', projectKey: 'PROJ' });

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-1" container={globalContainer} />
      </WithDi>
    );

    expect(await screen.findByText(EN_EMPTY)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open settings/i })).toBeInTheDocument();
  });

  it('shows GanttChartView when bars are present', async () => {
    const issue = new JiraTestDataBuilder().key('ST-1').build();
    issue.fields.duedate = '2021-06-01';

    registerMockJira(vi.fn().mockResolvedValue(Ok({ subtasks: [issue], externalLinks: [] })));
    ganttChartModule.ensure(globalContainer);

    const scopeKey = buildScopeKey('PROJ');
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: { [scopeKey]: scopeSettings() },
        statusBreakdownEnabled: false,
      })
    );
    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();
    model.setScope({ level: 'project', projectKey: 'PROJ' });

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-1" container={globalContainer} />
      </WithDi>
    );

    expect(await screen.findByTestId('gantt-chart-svg')).toBeInTheDocument();
  });

  it('DISP-25: shows missing-dates toolbar warning when some subtasks lack resolvable dates', async () => {
    ganttDisplayBddCtx.scenarioIssueKey = 'PROJ-2500';
    ganttDisplayBddCtx.scenarioProjectKey = 'PROJ';
    ganttDisplayBddCtx.scenarioIssueType = 'Epic';
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
    registerMockJira(vi.fn().mockResolvedValue(Ok({ subtasks: issues, externalLinks: [] })));
    ganttChartModule.ensure(globalContainer);

    applyGanttSettingsTable([
      { setting: 'startMapping', value: 'dateField: created' },
      { setting: 'endMapping', value: 'dateField: dueDate' },
      { setting: 'includeSubtasks', value: 'true' },
      { setting: 'includeEpicChildren', value: 'false' },
      { setting: 'includeIssueLinks', value: 'false' },
      { setting: 'scope', value: 'global' },
    ]);

    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();
    model.contextProjectKey = 'PROJ';
    model.contextIssueType = 'Epic';
    applyInitialGanttScopeForIssueView(model);

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-2500" container={globalContainer} />
      </WithDi>
    );

    expect(await screen.findByTestId('gantt-toolbar-warning-missing-dates')).toBeInTheDocument();
    expect(screen.getByTestId('gantt-toolbar-warning-missing-dates')).toHaveTextContent('2 tasks not on chart');
  });

  it('DISP-24: shows no-history toolbar warning when status breakdown is on and some bars lack changelog', async () => {
    ganttDisplayBddCtx.scenarioIssueKey = 'PROJ-2400';
    ganttDisplayBddCtx.scenarioProjectKey = 'PROJ';
    ganttDisplayBddCtx.scenarioIssueType = 'Epic';
    const rows: Record<string, string>[] = [
      {
        key: 'PROJ-2401',
        type: 'Story',
        relation: 'subtask',
        created: '2026-04-01',
        status: 'Done',
        statusCategory: 'done',
        dueDate: '2026-04-07',
        summary: 'Auth service',
      },
      {
        key: 'PROJ-2402',
        type: 'Story',
        relation: 'subtask',
        created: '2026-04-02',
        status: 'In Progress',
        statusCategory: 'indeterminate',
        dueDate: '2026-04-08',
        summary: 'Payment module',
      },
      {
        key: 'PROJ-2403',
        type: 'Bug',
        relation: 'subtask',
        created: '2026-04-03',
        status: 'To Do',
        statusCategory: 'new',
        dueDate: '2026-04-09',
        summary: 'Fix login bug',
      },
    ];
    const issues = rows.map(r => issueFromRow(r));
    const i2401 = issues.find(i => i.key === 'PROJ-2401')!;
    i2401.changelog = {
      startAt: 0,
      maxResults: 2,
      total: 2,
      histories: [
        {
          created: '2026-04-02T10:00:00',
          items: [
            {
              field: 'status',
              fieldtype: 'jira',
              from: '',
              to: '',
              fromString: 'To Do',
              toString: 'In Progress',
              fromStatusCategory: { key: 'new' },
              toStatusCategory: { key: 'indeterminate' },
            },
          ],
        },
        {
          created: '2026-04-05T14:00:00',
          items: [
            {
              field: 'status',
              fieldtype: 'jira',
              from: '',
              to: '',
              fromString: 'In Progress',
              toString: 'Done',
              fromStatusCategory: { key: 'indeterminate' },
              toStatusCategory: { key: 'done' },
            },
          ],
        },
      ],
    } as unknown as NonNullable<typeof i2401.changelog>;
    delete issues.find(i => i.key === 'PROJ-2402')!.changelog;
    delete issues.find(i => i.key === 'PROJ-2403')!.changelog;

    registerMockJira(vi.fn().mockResolvedValue(Ok({ subtasks: issues, externalLinks: [] })));
    ganttChartModule.ensure(globalContainer);

    applyGanttSettingsTable([
      { setting: 'startMapping', value: 'dateField: created' },
      { setting: 'endMapping', value: 'dateField: dueDate' },
      { setting: 'includeSubtasks', value: 'true' },
      { setting: 'includeEpicChildren', value: 'false' },
      { setting: 'includeIssueLinks', value: 'false' },
      { setting: 'scope', value: 'global' },
    ]);

    const { model } = globalContainer.inject(ganttSettingsModelToken);
    model.load();
    model.contextProjectKey = 'PROJ';
    model.contextIssueType = 'Epic';
    applyInitialGanttScopeForIssueView(model);
    model.toggleStatusBreakdown();
    model.save();

    render(
      <WithDi container={globalContainer}>
        <GanttChartContainer issueKey="PROJ-2400" container={globalContainer} />
      </WithDi>
    );

    expect(await screen.findByTestId('gantt-toolbar-warning-no-history')).toBeInTheDocument();
    expect(screen.getByTestId('gantt-toolbar-warning-no-history')).toHaveTextContent('No history for 2 of 3 tasks');
  });
});
