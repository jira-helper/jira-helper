import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Ok } from 'ts-results';
import { globalContainer } from 'dioma';
import { screen, waitFor } from '@testing-library/react';
import { GanttChartIssuePage } from './GanttChartIssuePage';
import type { IRoutingService } from 'src/infrastructure/routing';
import { routingServiceToken } from 'src/infrastructure/routing';
import { registerRoutingInDI } from 'src/infrastructure/di/routingTokens';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { GANTT_SETTINGS_STORAGE_KEY } from '../models/GanttSettingsModel';
import type { GanttScopeSettings } from '../types';
import { buildScopeKey } from '../utils/resolveSettings';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { resetIssueSettings } from 'src/issue-settings/issueSettingsModel';

const EN_FIRST_RUN = 'Gantt chart is not configured yet. Please configure start and end date mappings.';
const EN_EMPTY =
  'No subtasks found for this issue. The Gantt chart requires subtasks, epic children, or linked issues.';

describe('GanttChartIssuePage', () => {
  let modification: GanttChartIssuePage;
  const mockGetIssueId = vi.fn();
  const mockGetProjectKeyFromURL = vi.fn();

  beforeEach(() => {
    globalContainer.reset();
    registerTestDependencies(globalContainer);
    localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);

    const mockJira: IJiraService = {
      fetchSubtasks: vi.fn().mockResolvedValue(Ok({ subtasks: [], externalLinks: [] })),
      fetchJiraIssue: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
      getStatuses: vi.fn().mockResolvedValue(Ok([])),
    };
    globalContainer.register({ token: JiraServiceToken, value: mockJira });

    const mockRouting: IRoutingService = {
      getSearchParam: vi.fn(),
      getBoardIdFromURL: vi.fn(),
      getReportNameFromURL: vi.fn(),
      getCurrentRoute: vi.fn(),
      getIssueId: mockGetIssueId,
      getProjectKeyFromURL: mockGetProjectKeyFromURL,
      onUrlChange: vi.fn(),
    };
    globalContainer.register({ token: routingServiceToken, value: mockRouting });
    registerRoutingInDI(globalContainer);

    mockGetIssueId.mockReturnValue('PROJ-1');
    mockGetProjectKeyFromURL.mockReturnValue('PROJ');

    modification = new GanttChartIssuePage(globalContainer);
    document.body.innerHTML = '';
    resetIssueSettings();
  });

  afterEach(() => {
    modification.clear();
    vi.clearAllMocks();
  });

  describe('getModificationId', () => {
    it('returns gantt-chart-issue-page', () => {
      expect(modification.getModificationId()).toBe('gantt-chart-issue-page');
    });
  });

  describe('waitForLoading', () => {
    it('resolves to #details-module when it appears', async () => {
      const details = document.createElement('div');
      details.id = 'details-module';
      document.body.appendChild(details);

      const result = await modification.waitForLoading();
      expect(result).toBe(details);
      expect(result.matches('#details-module')).toBe(true);
    });
  });

  describe('apply', () => {
    function setupIssueViewDOM() {
      const details = document.createElement('div');
      details.id = 'details-module';
      document.body.appendChild(details);
      const attach = document.createElement('div');
      attach.id = 'attachmentmodule';
      document.body.appendChild(attach);
    }

    it('creates section with Collapse and renders FirstRunState when not configured', async () => {
      setupIssueViewDOM();

      const [data, el] = await Promise.all([modification.loadData(), modification.waitForLoading()]);
      modification.apply(data, el);

      const section = document.querySelector('[data-jh-section="gantt-chart"]');
      expect(section).not.toBeNull();

      expect(screen.getByText('Gantt Chart')).toBeInTheDocument();
      expect(screen.getByText(EN_FIRST_RUN)).toBeInTheDocument();
    });

    /**
     * Spec DISP-19 (replaces deferred BDD): the Gantt section must be inserted in the main
     * issue flow immediately after `#attachmentmodule`, and its content must be hidden by
     * default (collapsed). Click-to-expand is AntD's `Collapse` behavior — not retested here.
     */
    it('inserts the Gantt section right after #attachmentmodule and starts collapsed (DISP-19)', async () => {
      setupIssueViewDOM();

      const [data, el] = await Promise.all([modification.loadData(), modification.waitForLoading()]);
      modification.apply(data, el);

      const attachment = document.querySelector('#attachmentmodule');
      const section = document.querySelector('[data-jh-section="gantt-chart"]');
      expect(attachment?.nextElementSibling).toBe(section);

      const collapseHeader = document.querySelector('[data-jh-section="gantt-chart"] .ant-collapse-header');
      expect(collapseHeader?.getAttribute('aria-expanded')).toBe('false');
    });

    it('renders Gantt empty state when settings are configured', async () => {
      setupIssueViewDOM();

      const scopeKey = buildScopeKey('PROJ');
      const scopeSettings: GanttScopeSettings = {
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
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: { [scopeKey]: scopeSettings },
          statusBreakdownEnabled: false,
        })
      );

      const [data, el] = await Promise.all([modification.loadData(), modification.waitForLoading()]);
      modification.apply(data, el);

      await waitFor(() => {
        expect(screen.getByText(EN_EMPTY)).toBeInTheDocument();
      });
    });

    it('uses persisted preferredScopeLevel=projectIssueType when issue type is on page', async () => {
      setupIssueViewDOM();

      const typeVal = document.createElement('span');
      typeVal.id = 'type-val';
      typeVal.textContent = 'Story';
      document.body.appendChild(typeVal);

      const scopeKey = buildScopeKey('PROJ', 'Story');
      const storySettings: GanttScopeSettings = {
        startMappings: [{ source: 'dateField', fieldId: 'created' }],
        endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
        colorRules: [],
        tooltipFieldIds: ['custom-field'],
        exclusionFilters: [],
        hideCompletedTasks: false,
        includeSubtasks: true,
        includeEpicChildren: false,
        includeIssueLinks: false,
        issueLinkTypesToInclude: [],
      };
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: { [scopeKey]: storySettings },
          statusBreakdownEnabled: false,
          preferredScopeLevel: 'projectIssueType',
        })
      );

      const [data, el] = await Promise.all([modification.loadData(), modification.waitForLoading()]);
      modification.apply(data, el);

      await waitFor(() => {
        expect(screen.getByText(EN_EMPTY)).toBeInTheDocument();
      });

      const { ganttSettingsModelToken } = await import('../tokens');
      const { model } = globalContainer.inject(ganttSettingsModelToken);
      expect(model.currentScope).toEqual({
        level: 'projectIssueType',
        projectKey: 'PROJ',
        issueType: 'Story',
      });
    });

    it('falls back to project scope when preferredScopeLevel=projectIssueType but no type-val on page', async () => {
      const details = document.createElement('div');
      details.id = 'details-module';
      document.body.appendChild(details);

      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: {},
          statusBreakdownEnabled: false,
          preferredScopeLevel: 'projectIssueType',
        })
      );

      await modification.loadData();

      const { ganttSettingsModelToken } = await import('../tokens');
      const { model } = globalContainer.inject(ganttSettingsModelToken);
      expect(model.currentScope.level).toBe('project');
    });
  });
});
