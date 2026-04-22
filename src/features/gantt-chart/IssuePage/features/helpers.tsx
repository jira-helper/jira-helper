/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { Err, Ok } from 'ts-results';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { JiraTestDataBuilder } from 'src/infrastructure/jira/testData';
import type { JiraField, JiraIssueLinkType, JiraIssueMapped, JiraStatus } from 'src/infrastructure/jira/types';
import { useJiraFieldsStore } from 'src/infrastructure/jira/fields/jiraFieldsStore';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../models/GanttSettingsModel';
import { ganttChartModule } from '../../module';
import {
  ganttDataModelToken,
  ganttQuickFiltersModelToken,
  ganttSettingsModelToken,
  ganttViewportModelToken,
} from '../../tokens';
import type {
  ColorRule,
  DateMapping,
  ExclusionFilter,
  GanttScopeSettings,
  GanttSettingsStorage,
  QuickFilter,
} from '../../types';
import { applyInitialGanttScopeForIssueView } from '../../utils/applyInitialGanttScopeForIssueView';
import { buildScopeKey } from '../../utils/resolveSettings';
import { GanttChartContainer } from '../components/GanttChartContainer';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';

/** Mutable scenario state for BDD steps (ESM imports are not assignable). */
export type GanttDisplayBddCtx = {
  scenarioIssueKey: string;
  scenarioProjectKey: string;
  /** When set, mount uses project + issue type scope (e.g. settings scenarios). */
  scenarioIssueType: string | undefined;
  mockSubtasks: JiraIssueMapped[];
  /** When `err`, the mock Jira service returns Err(fetchSubtasksErrorMessage) from fetchSubtasks. */
  fetchSubtasksMode: 'ok' | 'err';
  fetchSubtasksErrorMessage: string;
  /** When set, attempt `n` returns `errorSequence[n-1]` until exhausted (ERR-4). */
  fetchSubtasksErrorSequence: string[] | null;
  /** Optional delay before a successful fetch resolves (keeps loading state visible; ERR-3). */
  fetchSubtasksSuccessDelayMs: number;
  /** First call returns failure, subsequent calls return mock subtasks (ERR-2 retry). */
  fetchSubtasksFailFirstThenOk: boolean;
  fetchSubtasksCallCount: number;
};

function createGanttDisplayBddCtx(): GanttDisplayBddCtx {
  return {
    scenarioIssueKey: 'PROJ-100',
    scenarioProjectKey: 'PROJ',
    scenarioIssueType: undefined,
    mockSubtasks: [],
    fetchSubtasksMode: 'ok',
    fetchSubtasksErrorMessage: '',
    fetchSubtasksErrorSequence: null,
    fetchSubtasksSuccessDelayMs: 0,
    fetchSubtasksFailFirstThenOk: false,
    fetchSubtasksCallCount: 0,
  };
}

type BddGlobal = typeof globalThis & { __jhGanttDisplayBddCtx?: GanttDisplayBddCtx };

function bddGlobalObject(): BddGlobal {
  if (typeof window !== 'undefined') {
    return window as unknown as BddGlobal;
  }
  return globalThis as BddGlobal;
}

/**
 * Single mutable context for Gantt display BDD. Stored on `window` (when present) so Cypress
 * component tests — where duplicate Vite chunks may load `helpers` twice, and `globalThis` can
 * diverge from the spec `window` — still share the same object as `registerMockJira`.
 */
export const ganttDisplayBddCtx: GanttDisplayBddCtx = (bddGlobalObject().__jhGanttDisplayBddCtx ??=
  createGanttDisplayBddCtx());

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

/** Gherkin tables may use ASCII `-` or Unicode en/em dash for “no date”. */
function isMissingDateTableCell(raw: string | undefined): boolean {
  const s = (raw ?? '').replace(/\u2013|\u2014/g, '-').trim();
  return s === '' || s === '-';
}

function ganttScopeSettingsFromFlatRow(map: Record<string, string>): GanttScopeSettings {
  const startRaw = map.startMappings ?? map.startMapping;
  const endRaw = map.endMappings ?? map.endMapping;
  const startMappings = parseDateMappings(startRaw ?? '');
  const endMappings = parseDateMappings(endRaw ?? '');
  return {
    startMappings: startMappings.length > 0 ? startMappings : [{ source: 'dateField' as const, fieldId: 'created' }],
    endMappings: endMappings.length > 0 ? endMappings : [{ source: 'dateField' as const, fieldId: 'duedate' }],
    colorRules: [],
    tooltipFieldIds: map.tooltipFieldIds
      ? map.tooltipFieldIds
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [],
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

  const scopeRaw = (map.scope ?? '_global').trim();
  const scopeKey = scopeRaw === '_global' || scopeRaw === 'global' ? buildScopeKey() : buildScopeKey(scopeRaw);

  return { scopeKey, settings: ganttScopeSettingsFromFlatRow(map) };
}

/** Persist multiple scope rows (DataTable: scope | startMapping | endMapping | …). */
function scopeKeyFromGanttRowScope(rowScope: string): string {
  const raw = rowScope.trim();
  if (raw === 'global' || raw === '_global') {
    return buildScopeKey();
  }
  return raw;
}

export function applyGanttScopesTable(rows: DataTableRows): void {
  const storage: GanttSettingsStorage = {};
  for (const row of rows) {
    const r = row as Record<string, string>;
    const label = (r.scopeKey ?? r.scope ?? '').trim();
    const storageKey = scopeKeyFromGanttRowScope(label);
    storage[storageKey] = ganttScopeSettingsFromFlatRow(r);
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

/** Stable id for BDD-seeded quick filter presets (matches {@link seedCustomQuickFiltersFromTable}). */
export function bddQuickFilterIdFromName(name: string): string {
  return `bdd-qf-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

/**
 * Appends test quick-filter presets to the current global scope in `jh-gantt-settings`
 * (call after `applyGanttSettingsTable` / Background, before mount).
 */
export function seedCustomQuickFiltersFromTable(rows: DataTableRows): void {
  const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
  if (!raw) {
    throw new Error('Gantt settings must exist before seeding custom quick filters');
  }
  const payload = JSON.parse(raw) as { storage: Record<string, GanttScopeSettings> };
  const scopeKey = buildScopeKey();
  const s = payload.storage[scopeKey];
  if (!s) {
    throw new Error(`No Gantt settings for scope ${scopeKey}`);
  }
  const nextFilters: QuickFilter[] = [...(s.quickFilters ?? [])];
  for (const row of rows) {
    const { name } = row;
    const id = bddQuickFilterIdFromName(name);
    const mode = row.mode as 'jql' | 'field';
    if (mode === 'jql') {
      nextFilters.push({ id, name, selector: { mode: 'jql', jql: row.jql ?? '' } });
    } else {
      nextFilters.push({
        id,
        name,
        selector: { mode: 'field', fieldId: row.fieldId ?? '', value: row.value ?? '' },
      });
    }
  }
  payload.storage[scopeKey] = { ...s, quickFilters: nextFilters };
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

const bddMockLinkTypes: JiraIssueLinkType[] = [
  { id: '10000', name: 'Blocks', inward: 'is blocked by', outward: 'blocks', self: '' },
  { id: '10001', name: 'Relates', inward: 'relates to', outward: 'relates to', self: '' },
];

/** Merge exclusion filters into the first scope in `jh-gantt-settings` (call after `applyGanttSettingsTable`). */
export function applyExclusionFiltersTable(rows: DataTableRows): void {
  const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
  if (!raw) {
    throw new Error('Gantt settings must be configured before exclusion filters');
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
  const exclusionFilters: ExclusionFilter[] = rows.map(r => {
    const mode = r.mode as 'field' | 'jql';
    if (mode === 'jql') {
      return { mode: 'jql', jql: (r.jql ?? '').trim() };
    }
    return {
      mode: 'field' as const,
      fieldId: (r.fieldId ?? '').trim(),
      value: (r.value ?? '').trim(),
    };
  });
  payload.storage[scopeKey] = { ...settings, exclusionFilters };
  localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
}

/** Map link type name → `issueLinkTypesToInclude` entries (ids from `bddMockLinkTypes`). */
export function applyLinkTypeInclusionTable(rows: DataTableRows): void {
  const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
  if (!raw) {
    throw new Error('Gantt settings must be configured before issue link type inclusion');
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
  const issueLinkTypesToInclude = rows.map(r => {
    const name = (r.linkType ?? '').trim();
    const lt = bddMockLinkTypes.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (!lt) {
      throw new Error(`Unknown link type name: ${name}`);
    }
    const direction = String(r.direction).toLowerCase() as 'inward' | 'outward';
    return { id: lt.id, direction };
  });
  payload.storage[scopeKey] = { ...settings, issueLinkTypesToInclude };
  localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
}

/** Empty `issueLinkTypesToInclude` ⇒ no restriction (all link types) when `includeIssueLinks` is on. */
export function applyEmptyLinkTypeInclusion(): void {
  const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
  if (!raw) {
    throw new Error('Gantt settings must be configured before issue link type inclusion');
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
  payload.storage[scopeKey] = { ...settings, issueLinkTypesToInclude: [] };
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
  const relation = (row.relation ?? 'subtask').trim();
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

  if (relation === 'epicChild' || relation === 'epic-child') {
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
  } else if (relation === 'blocks (inward)') {
    issue.fields.issuelinks = [
      {
        type: { id: '10000', name: 'Blocks' },
        inwardIssue: { key: ganttDisplayBddCtx.scenarioIssueKey },
      },
    ];
  } else if (relation === 'is cloned by (inward)') {
    issue.fields.issuelinks = [
      {
        type: { id: '10001', name: 'Relates' },
        inwardIssue: { key: ganttDisplayBddCtx.scenarioIssueKey },
      },
    ];
  } else if (relation === 'relates to (outward)') {
    issue.fields.issuelinks = [
      {
        type: { id: '10001', name: 'Relates' },
        outwardIssue: { key: ganttDisplayBddCtx.scenarioIssueKey },
      },
    ];
  } else if (relation === 'epicChild' || relation === 'epic-child') {
    issue.fields.issuelinks = [];
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

  if (!isMissingDateTableCell(row.created)) {
    issue.fields.created = row.created;
  } else {
    delete (issue.fields as Record<string, unknown>).created;
  }
  /** {@link JiraIssueMapped} duplicates `fields.created` on the root; keep aligned after BDD edits. */
  const rootCreated = issue as unknown as { created?: string };
  if (issue.fields.created) {
    rootCreated.created = String(issue.fields.created);
  } else {
    delete rootCreated.created;
  }

  if (!isMissingDateTableCell(row.dueDate)) {
    issue.fields.duedate = row.dueDate;
  } else {
    delete (issue.fields as Record<string, unknown>).duedate;
  }

  const startDateField = (row as Record<string, string>).startDate;
  if (!isMissingDateTableCell(startDateField)) {
    (issue.fields as Record<string, unknown>).startdate = startDateField;
  } else {
    delete (issue.fields as Record<string, unknown>).startdate;
  }

  if (row.resolution !== undefined && row.resolution !== '' && row.resolution !== '-') {
    (issue.fields as Record<string, unknown>).resolution = {
      name: row.resolution,
      id: '1',
    };
  } else {
    (issue.fields as Record<string, unknown>).resolution = null;
  }

  if (row.team) {
    (issue.fields as Record<string, unknown>).team = { value: row.team };
  }

  const projectKeyFromIssue = row.key.includes('-') ? row.key.split('-')[0]! : ganttDisplayBddCtx.scenarioProjectKey;
  (issue.fields as Record<string, unknown>).project = {
    id: `id-${projectKeyFromIssue}`,
    key: projectKeyFromIssue,
  };

  if (row.assignee) {
    if (row.assignee === '-') {
      (issue.fields as Record<string, unknown>).assignee = null;
    } else {
      (issue.fields as Record<string, unknown>).assignee = {
        displayName: row.assignee,
        name: row.assignee,
        key: row.assignee.toLowerCase().replace(/\s/g, '.'),
        emailAddress: `${row.assignee}@test.example.com`,
        active: true,
        self: '',
        timeZone: 'UTC',
        avatarUrls: { '48x48': '' },
      };
    }
  }

  /** Plain data only — avoids browser-only live objects that keep `created` after `delete`. */
  return JSON.parse(JSON.stringify(issue)) as JiraIssueMapped;
}

const bddMockJiraFields: JiraField[] = [
  {
    id: 'created',
    name: 'Created',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['created'],
    schema: { type: 'date' },
  },
  {
    id: 'duedate',
    name: 'Due date',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['duedate'],
    schema: { type: 'date' },
  },
  {
    id: 'startdate',
    name: 'Start date',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['startdate'],
    schema: { type: 'date' },
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
  {
    id: 'summary',
    name: 'Summary',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['summary'],
    schema: { type: 'string' },
  },
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
  {
    id: 'resolution',
    name: 'Resolution',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['resolution'],
    schema: { type: 'string' },
  },
  {
    id: 'team',
    name: 'Team',
    custom: true,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['team', 'cf[10001]'],
    schema: { type: 'option' },
  },
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

const bddMockStatuses: JiraStatus[] = [
  {
    id: '5',
    name: 'Cancelled',
    statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' },
  },
  {
    id: '1',
    name: 'Done',
    statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' },
  },
  {
    id: '2',
    name: 'In Progress',
    statusCategory: { id: 2, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  {
    id: '3',
    name: 'To Do',
    statusCategory: { id: 1, key: 'new', colorName: 'blue', name: 'To Do' },
  },
  {
    id: '4',
    name: 'Released',
    statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' },
  },
];

/** Prefer `window` in browser CT so `fetchSubtasks` reads the same object BDD steps mutate. */
function bddCtxLive(): GanttDisplayBddCtx {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { __jhGanttDisplayBddCtx?: GanttDisplayBddCtx };
    if (w.__jhGanttDisplayBddCtx) {
      return w.__jhGanttDisplayBddCtx;
    }
  }
  return ganttDisplayBddCtx;
}

function registerMockJira(): void {
  const mock: IJiraService = {
    fetchSubtasks: async () => {
      const ctx = bddCtxLive();
      ctx.fetchSubtasksCallCount += 1;
      const n = ctx.fetchSubtasksCallCount;
      const seq = ctx.fetchSubtasksErrorSequence;
      if (seq && seq.length > 0 && n <= seq.length) {
        return Err(new Error(seq[n - 1]!));
      }
      if (ctx.fetchSubtasksFailFirstThenOk && n === 1) {
        return Err(new Error(ctx.fetchSubtasksErrorMessage));
      }
      if (ctx.fetchSubtasksMode === 'err' && !seq) {
        return Err(new Error(ctx.fetchSubtasksErrorMessage));
      }
      const delayMs = ctx.fetchSubtasksSuccessDelayMs;
      if (delayMs > 0) {
        await new Promise(r => {
          setTimeout(r, delayMs);
        });
      }
      const subtasks = ctx.mockSubtasks.map(i => JSON.parse(JSON.stringify(i)) as JiraIssueMapped);
      return Ok({ subtasks, externalLinks: [] });
    },
    fetchJiraIssue: async () => Err(new Error('fetchJiraIssue not used in Gantt display tests')),
    getExternalIssues: async () => Ok([]),
    getProjectFields: async () => Ok(bddMockJiraFields),
    getIssueLinkTypes: async () => Ok(bddMockLinkTypes),
    getStatuses: async () => Ok(bddMockStatuses),
  };
  globalContainer.register({ token: JiraServiceToken, value: mock });
}

export const setupBackground = (): void => {
  globalContainer.reset();
  useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
  useJiraFieldsStore.setState({ fields: [], isLoading: false, error: null });
  useJiraStatusesStore.setState({ statuses: [], isLoading: false, error: null });
  localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
  registerTestDependencies(globalContainer);
  ganttDisplayBddCtx.mockSubtasks = [];
  ganttDisplayBddCtx.fetchSubtasksMode = 'ok';
  ganttDisplayBddCtx.fetchSubtasksErrorMessage = '';
  ganttDisplayBddCtx.fetchSubtasksErrorSequence = null;
  ganttDisplayBddCtx.fetchSubtasksSuccessDelayMs = 0;
  ganttDisplayBddCtx.fetchSubtasksFailFirstThenOk = false;
  ganttDisplayBddCtx.fetchSubtasksCallCount = 0;
  ganttDisplayBddCtx.scenarioIssueKey = 'PROJ-100';
  ganttDisplayBddCtx.scenarioProjectKey = 'PROJ';
  ganttDisplayBddCtx.scenarioIssueType = undefined;
  registerMockJira();
  ganttChartModule.ensure(globalContainer);
  globalContainer.inject(ganttQuickFiltersModelToken).model.clear();
};

/** Sets chart zoom in the Valtio viewport (use after `mountIssueViewWithGantt` in the Cypress queue). */
export function setGanttViewportZoomLevelForBdd(zoom: number): void {
  ganttChartModule.ensure(globalContainer);
  globalContainer.inject(ganttViewportModelToken).model.setZoomLevel(zoom);
}

export const mountIssueViewWithGantt = (options: { withIssueDetails?: boolean } = {}): void => {
  void options;
  ganttChartModule.ensure(globalContainer);
  globalContainer.inject(ganttQuickFiltersModelToken).model.clear();
  const { model } = globalContainer.inject(ganttSettingsModelToken);
  model.load();
  model.contextProjectKey = ganttDisplayBddCtx.scenarioProjectKey;
  model.contextIssueType = ganttDisplayBddCtx.scenarioIssueType ?? '';
  applyInitialGanttScopeForIssueView(model);

  const chart = <GanttChartContainer issueKey={ganttDisplayBddCtx.scenarioIssueKey} container={globalContainer} />;

  cy.mount(<WithDi container={globalContainer}>{chart}</WithDi>);
};

/**
 * Simulates a full page reload for component tests: resets DI and in-memory stores but keeps
 * `localStorage` (e.g. persisted Gantt settings / quick-filter presets).
 */
export function reloadGanttPreservingStorage(): void {
  globalContainer.reset();
  useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
  useJiraFieldsStore.setState({ fields: [], isLoading: false, error: null });
  useJiraStatusesStore.setState({ statuses: [], isLoading: false, error: null });
  registerTestDependencies(globalContainer);
  registerMockJira();
  ganttChartModule.ensure(globalContainer);
  mountIssueViewWithGantt({ withIssueDetails: true });
  /**
   * Session quick-filter state must reset after remount. Run in the Cypress command queue so it
   * executes after `cy.mount` flushes — otherwise `clear()` can race the first paint / DI `lazy()`
   * cache and leave chips or JQL mode appearing "stuck".
   */
  cy.wrap(null).then(() => {
    globalContainer.inject(ganttQuickFiltersModelToken).model.clear();
  });
}

/** BDD: sets scenario issue/project context then mounts the Gantt issue view. */
export function mountIssueViewWithGanttForScope(args: {
  projectKey: string;
  issueType: string;
  issueKey: string;
}): void {
  ganttDisplayBddCtx.scenarioProjectKey = args.projectKey;
  ganttDisplayBddCtx.scenarioIssueType = args.issueType;
  ganttDisplayBddCtx.scenarioIssueKey = args.issueKey;
  mountIssueViewWithGantt({ withIssueDetails: true });
}

/**
 * Writes changelog transitions onto a mock subtask (BDD). Call {@link triggerChartRerender} after
 * mutating mock data so {@link GanttDataModel} recomputes bars from `cachedIssues`.
 */
export function setMockIssueChangelogFromTransitionsTable(
  issueKey: string,
  table: DataTableRows,
  opts: { withCategory: boolean }
): void {
  const issue = ganttDisplayBddCtx.mockSubtasks.find(i => i.key === issueKey);
  if (!issue) {
    throw new Error(`Unknown linked issue ${issueKey}; define linked issues before changelog.`);
  }
  issue.changelog = {
    startAt: 0,
    maxResults: table.length,
    total: table.length,
    histories: table.map(row => ({
      created: row.timestamp,
      items: [
        {
          field: 'status',
          fieldtype: 'jira',
          from: null,
          to: null,
          fromString: row.fromStatus,
          toString: row.toStatus,
          ...(opts.withCategory
            ? {
                fromStatusCategory: { key: row.fromCategory },
                toStatusCategory: { key: row.toCategory },
              }
            : {}),
        },
      ],
    })),
  };
}

/** Preset transitions fully inside each issue’s bar window (DISP-24 dynamic steps). */
const bddChangelogCoveringBarWindowPresets: Record<string, DataTableRows> = {
  'PROJ-2402': [
    {
      timestamp: '2026-04-02T09:00:00',
      fromStatus: '-',
      toStatus: 'To Do',
      fromCategory: '-',
      toCategory: 'new',
    },
    {
      timestamp: '2026-04-04T11:00:00',
      fromStatus: 'To Do',
      toStatus: 'In Progress',
      fromCategory: 'new',
      toCategory: 'indeterminate',
    },
  ],
  'PROJ-2403': [
    {
      timestamp: '2026-04-03T09:00:00',
      fromStatus: '-',
      toStatus: 'To Do',
      fromCategory: '-',
      toCategory: 'new',
    },
    {
      timestamp: '2026-04-05T11:00:00',
      fromStatus: 'To Do',
      toStatus: 'In Progress',
      fromCategory: 'new',
      toCategory: 'indeterminate',
    },
    {
      timestamp: '2026-04-06T12:00:00',
      fromStatus: 'In Progress',
      toStatus: 'To Do',
      fromCategory: 'indeterminate',
      toCategory: 'new',
    },
  ],
};

export function addChangelogTransitionsCoveringBarWindow(issueKey: string): void {
  const rows = bddChangelogCoveringBarWindowPresets[issueKey];
  if (!rows) {
    throw new Error(`No preset changelog for ${issueKey} (add to bddChangelogCoveringBarWindowPresets).`);
  }
  setMockIssueChangelogFromTransitionsTable(issueKey, rows, { withCategory: true });
}

/**
 * Merges field updates into `mockSubtasks` for BDD dynamics (e.g. DISP-25). Keys match table
 * column names: `created`, `dueDate` → `fields.duedate`, `summary`, etc.
 */
export function updateMockSubtaskField(issueKey: string, fieldUpdates: Record<string, unknown>): void {
  const issue = ganttDisplayBddCtx.mockSubtasks.find(i => i.key === issueKey);
  if (!issue) {
    throw new Error(`Unknown linked issue ${issueKey}`);
  }
  const f = issue.fields as Record<string, unknown>;
  for (const [rawKey, rawVal] of Object.entries(fieldUpdates)) {
    if (rawVal === undefined) continue;
    const key = rawKey;
    if (key === 'dueDate') {
      if (rawVal === null || rawVal === '' || rawVal === '-') {
        delete f.duedate;
      } else {
        f.duedate = String(rawVal);
      }
      continue;
    }
    if (key === 'created') {
      if (rawVal === null || rawVal === '' || rawVal === '-') {
        delete f.created;
        delete (issue as unknown as { created?: string }).created;
      } else {
        f.created = String(rawVal);
        (issue as unknown as { created?: string }).created = String(rawVal);
      }
      continue;
    }
    if (key === 'summary') {
      f.summary = String(rawVal);
      continue;
    }
    f[key] = rawVal;
  }
}

/** Recompute from updated `mockSubtasks` without remount or loading-state flash (fetch clones issues). */
export function triggerChartRerender(): void {
  cy.wrap(null).then(() => {
    const dataModel = globalContainer.inject(ganttDataModelToken).model;
    const settingsModel = globalContainer.inject(ganttSettingsModelToken).model;
    const resolved = settingsModel.resolvedSettings;
    if (!resolved) {
      throw new Error('Gantt settings not resolved');
    }
    if (dataModel.loadingState !== 'loaded') {
      throw new Error(`Chart not loaded (state: ${dataModel.loadingState})`);
    }
    dataModel.replaceCachedIssuesForTests(ganttDisplayBddCtx.mockSubtasks);
    dataModel.recompute(resolved);
  });
}
