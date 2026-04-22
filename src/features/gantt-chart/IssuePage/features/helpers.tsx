/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { Err, Ok } from 'ts-results';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { JiraTestDataBuilder } from 'src/infrastructure/jira/testData';
import type { JiraIssueMapped } from 'src/infrastructure/jira/types';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../models/GanttSettingsModel';
import { ganttChartModule } from '../../module';
import { ganttSettingsModelToken } from '../../tokens';
import type { ColorRule, DateMapping, GanttScopeSettings, GanttSettingsStorage } from '../../types';
import { buildScopeKey } from '../../utils/resolveSettings';
import { GanttChartContainer } from '../components/GanttChartContainer';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';

/** Mutable scenario state for BDD steps (ESM imports are not assignable). */
export const ganttDisplayBddCtx = {
  scenarioIssueKey: 'PROJ-100',
  scenarioProjectKey: 'PROJ',
  /** When set, mount uses project + issue type scope (e.g. settings scenarios). */
  scenarioIssueType: undefined as string | undefined,
  mockSubtasks: [] as JiraIssueMapped[],
  /** When `err`, the mock Jira service returns Err(fetchSubtasksErrorMessage) from fetchSubtasks. */
  fetchSubtasksMode: 'ok' as 'ok' | 'err',
  fetchSubtasksErrorMessage: '',
};

export function parseDateMapping(raw: string): DateMapping {
  const s = raw.trim();
  if (s.startsWith('dateField:')) {
    let fieldId = s.slice('dateField:'.length).trim();
    if (fieldId === 'dueDate') {
      fieldId = 'duedate';
    }
    return { source: 'dateField', fieldId };
  }
  if (s.startsWith('statusTransition:')) {
    return { source: 'statusTransition', statusName: s.slice('statusTransition:'.length).trim() };
  }
  throw new Error(`Unsupported date mapping: ${raw}`);
}

/**
 * Parse a comma-separated list of date mappings (priority order).
 * Single mapping (no comma) yields a one-element list — keeping legacy feature tables working.
 *
 * @example "dateField: dueDate, statusTransition: Done" → [{...dueDate}, {...Done}]
 */
export function parseDateMappings(raw: string): DateMapping[] {
  return raw
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(parseDateMapping);
}

function ganttScopeSettingsFromFlatRow(map: Record<string, string>): GanttScopeSettings {
  const startRaw = map.startMappings ?? map.startMapping;
  const endRaw = map.endMappings ?? map.endMapping;
  return {
    startMappings: parseDateMappings(startRaw ?? ''),
    endMappings: parseDateMappings(endRaw ?? ''),
    colorRules: [],
    tooltipFieldIds: [],
    exclusionFilters: [],
    hideCompletedTasks: map.hideCompletedTasks === 'true',
    includeSubtasks: map.includeSubtasks === 'true',
    includeEpicChildren: map.includeEpicChildren === 'true',
    includeIssueLinks: map.includeIssueLinks === 'true',
    issueLinkTypesToInclude: [],
  };
}

function scopeSettingsFromTable(rows: DataTableRows): { scopeKey: string; settings: GanttScopeSettings } {
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.setting] = row.value;
  }

  const scopeRaw = map.scope ?? '_global';
  const scopeKey = scopeRaw === '_global' ? buildScopeKey() : buildScopeKey(scopeRaw);

  return { scopeKey, settings: ganttScopeSettingsFromFlatRow(map) };
}

/** Persist multiple scope rows (DataTable: scope | startMapping | endMapping | …). */
export function applyGanttScopesTable(rows: DataTableRows): void {
  const storage: GanttSettingsStorage = {};
  for (const row of rows) {
    storage[row.scope] = ganttScopeSettingsFromFlatRow(row);
  }
  const payload = {
    storage,
    statusBreakdownEnabled: false,
  };
  localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
}

/** Mutate the stored payload to set `preferredScopeLevel` (used by FR-10 effective-scope tests). */
export function setPersistedPreferredScopeLevel(level: 'global' | 'project' | 'projectIssueType'): void {
  const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
  const parsed = raw
    ? (JSON.parse(raw) as { storage?: GanttSettingsStorage; statusBreakdownEnabled?: boolean })
    : { storage: {} as GanttSettingsStorage, statusBreakdownEnabled: false };
  const next = {
    storage: parsed.storage ?? {},
    statusBreakdownEnabled: Boolean(parsed.statusBreakdownEnabled),
    preferredScopeLevel: level,
  };
  localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(next));
}

export function applyGanttSettingsTable(rows: DataTableRows): void {
  const { scopeKey, settings } = scopeSettingsFromTable(rows);
  const payload = {
    storage: { [scopeKey]: settings } as Record<string, GanttScopeSettings>,
    statusBreakdownEnabled: false,
  };
  localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
}

/** Merge color rules into the first scope already stored (call after `applyGanttSettingsTable`). */
export function mergeColorRulesIntoCurrentGanttStorage(rows: DataTableRows): void {
  const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
  if (!raw) {
    throw new Error('Gantt settings must be configured before color rules');
  }
  const payload = JSON.parse(raw) as {
    storage: Record<string, GanttScopeSettings>;
    statusBreakdownEnabled?: boolean;
  };
  const scopeKeys = Object.keys(payload.storage);
  if (scopeKeys.length === 0) {
    throw new Error('No scope in Gantt storage');
  }
  const scopeKey = scopeKeys[0];
  const settings = payload.storage[scopeKey];
  const colorRules: ColorRule[] = rows.map(r => {
    const mode = r.mode as 'field' | 'jql';
    if (mode === 'jql') {
      return {
        selector: { mode: 'jql', jql: r.jql ?? r.value ?? '' },
        color: r.color,
      };
    }
    return {
      selector: { mode: 'field', fieldId: r.fieldId, value: r.value },
      color: r.color,
    };
  });
  payload.storage[scopeKey] = { ...settings, colorRules };
  localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
}

export function issueFromRow(row: Record<string, string>): JiraIssueMapped {
  const statusCategory = row.statusCategory as 'new' | 'indeterminate' | 'done';
  const statusColor = statusCategory === 'done' ? 'green' : statusCategory === 'new' ? 'blue' : 'yellow';
  const builder = new JiraTestDataBuilder().key(row.key).status({
    status: row.status,
    statusId: 1,
    statusCategory,
    statusColor,
  });
  const issue = builder.build();
  const issuetypeName = row.type ?? 'Task';
  const relation = row.relation ?? 'subtask';
  issue.id = `id-${row.key}`;
  issue.fields.issuetype = { name: issuetypeName, subtask: relation === 'subtask' };

  if (relation === 'subtask') {
    issue.fields.parent = {
      key: ganttDisplayBddCtx.scenarioIssueKey,
      id: `id-${ganttDisplayBddCtx.scenarioIssueKey}`,
    };
  } else {
    delete (issue.fields as Record<string, unknown>).parent;
  }

  if (relation === 'epicChild') {
    issue.fields.customfield_10001 = ganttDisplayBddCtx.scenarioIssueKey;
  } else {
    delete (issue.fields as Record<string, unknown>).customfield_10001;
  }

  if (relation === 'issueLink') {
    issue.fields.issuelinks = [
      {
        type: { id: '10000', name: 'Relates' },
        outwardIssue: { key: ganttDisplayBddCtx.scenarioIssueKey },
      },
    ];
  } else if (relation !== 'subtask') {
    issue.fields.issuelinks = [];
  }

  if (row.summary) {
    issue.fields.summary = row.summary;
  }

  if (row.priority) {
    const prev = issue.fields.priority;
    issue.fields.priority =
      prev && typeof prev === 'object'
        ? { ...prev, name: row.priority }
        : {
            name: row.priority,
            id: '1',
            iconUrl: '',
            self: '',
          };
  }

  if (row.created && row.created !== '-') {
    issue.fields.created = row.created;
  } else {
    delete (issue.fields as Record<string, unknown>).created;
  }

  if (row.dueDate && row.dueDate !== '-') {
    issue.fields.duedate = row.dueDate;
  } else {
    delete (issue.fields as Record<string, unknown>).duedate;
  }

  return issue;
}

function registerMockJira(): void {
  const mock: IJiraService = {
    fetchSubtasks: async () => {
      if (ganttDisplayBddCtx.fetchSubtasksMode === 'err') {
        return Err(new Error(ganttDisplayBddCtx.fetchSubtasksErrorMessage));
      }
      return Ok({ subtasks: ganttDisplayBddCtx.mockSubtasks, externalLinks: [] });
    },
    fetchJiraIssue: async () => Err(new Error('fetchJiraIssue not used in Gantt display tests')),
    getExternalIssues: async () => Ok([]),
    getProjectFields: async () => Ok([]),
    getIssueLinkTypes: async () => Ok([]),
  };
  globalContainer.register({ token: JiraServiceToken, value: mock });
}

export const setupBackground = (): void => {
  globalContainer.reset();
  useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
  localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
  registerTestDependencies(globalContainer);
  ganttDisplayBddCtx.mockSubtasks = [];
  ganttDisplayBddCtx.fetchSubtasksMode = 'ok';
  ganttDisplayBddCtx.fetchSubtasksErrorMessage = '';
  ganttDisplayBddCtx.scenarioIssueKey = 'PROJ-100';
  ganttDisplayBddCtx.scenarioProjectKey = 'PROJ';
  ganttDisplayBddCtx.scenarioIssueType = undefined;
  registerMockJira();
  ganttChartModule.ensure(globalContainer);
};

export const mountIssueViewWithGantt = (options: { withIssueDetails?: boolean } = {}): void => {
  const { withIssueDetails = true } = options;
  ganttChartModule.ensure(globalContainer);
  const { model } = globalContainer.inject(ganttSettingsModelToken);
  model.load();
  model.contextProjectKey = ganttDisplayBddCtx.scenarioProjectKey;
  model.contextIssueType = ganttDisplayBddCtx.scenarioIssueType ?? '';
  // Mirror GanttChartIssuePage.loadData: prefer the effective scope (where settings actually
  // live) over a stale preferred level. Falls back to scenario-derived level when storage
  // does not constrain it (e.g. fresh first-run scenarios).
  const fallbackLevel: 'global' | 'project' | 'projectIssueType' = ganttDisplayBddCtx.scenarioIssueType
    ? 'projectIssueType'
    : 'project';
  const initialLevel: 'global' | 'project' | 'projectIssueType' =
    model.effectiveScopeLevel ?? model.preferredScopeLevel ?? fallbackLevel;

  if (initialLevel === 'global') {
    model.setScope({ level: 'global' });
  } else if (initialLevel === 'projectIssueType' && ganttDisplayBddCtx.scenarioIssueType) {
    model.setScope({
      level: 'projectIssueType',
      projectKey: ganttDisplayBddCtx.scenarioProjectKey,
      issueType: ganttDisplayBddCtx.scenarioIssueType,
    });
  } else {
    model.setScope({ level: 'project', projectKey: ganttDisplayBddCtx.scenarioProjectKey });
  }

  const chart = <GanttChartContainer issueKey={ganttDisplayBddCtx.scenarioIssueKey} container={globalContainer} />;

  cy.mount(
    <WithDi container={globalContainer}>
      {withIssueDetails ? (
        <div>
          <div data-testid="issue-details-block">Issue details</div>
          {chart}
        </div>
      ) : (
        chart
      )}
    </WithDi>
  );
};
