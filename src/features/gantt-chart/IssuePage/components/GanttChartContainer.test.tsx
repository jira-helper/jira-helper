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
});
