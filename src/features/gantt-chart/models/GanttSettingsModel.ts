import type { GanttScopeSettings, GanttSettingsStorage, SettingsScope, ScopeKey } from '../types';
import { buildScopeKey, resolveSettings } from '../utils/resolveSettings';
import type { Logger } from 'src/shared/Logger';

export const GANTT_SETTINGS_STORAGE_KEY = 'jh-gantt-settings';

type PersistedPayloadV1 = {
  storage: GanttSettingsStorage;
  statusBreakdownEnabled?: boolean;
  preferredScopeLevel?: SettingsScope['level'];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

type ParsedPayload = {
  storage: GanttSettingsStorage;
  statusBreakdownEnabled: boolean;
  preferredScopeLevel: SettingsScope['level'] | null;
};

/**
 * Migrate legacy `exclusionFilter` (single) to `exclusionFilters` (array).
 * Also ensures `hideCompletedTasks` defaults to `false` for old data.
 */
function migrateScope(settings: Record<string, unknown>): void {
  if (settings.exclusionFilter && !settings.exclusionFilters) {
    settings.exclusionFilters = [settings.exclusionFilter];
  }
  if (!Array.isArray(settings.exclusionFilters)) {
    settings.exclusionFilters = [];
  }
  if (typeof settings.hideCompletedTasks !== 'boolean') {
    settings.hideCompletedTasks = false;
  }
  delete settings.exclusionFilter;
}

function parseStoredPayload(raw: string | null): ParsedPayload {
  if (!raw || raw.trim() === '') {
    return { storage: {}, statusBreakdownEnabled: false, preferredScopeLevel: null };
  }
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) {
    return { storage: {}, statusBreakdownEnabled: false, preferredScopeLevel: null };
  }
  if ('storage' in parsed && isRecord(parsed.storage)) {
    const p = parsed as PersistedPayloadV1;
    const storage = p.storage as GanttSettingsStorage;
    for (const settings of Object.values(storage)) {
      if (settings && typeof settings === 'object') {
        migrateScope(settings as unknown as Record<string, unknown>);
      }
    }
    return {
      storage,
      statusBreakdownEnabled: Boolean(p.statusBreakdownEnabled),
      preferredScopeLevel: p.preferredScopeLevel ?? null,
    };
  }
  return { storage: parsed as GanttSettingsStorage, statusBreakdownEnabled: false, preferredScopeLevel: null };
}

function resolveArgsForScope(scope: SettingsScope): { projectKey: string; issueType?: string } {
  if (scope.level === 'global') {
    return { projectKey: '' };
  }
  if (scope.level === 'project') {
    return { projectKey: scope.projectKey ?? '' };
  }
  return { projectKey: scope.projectKey ?? '', issueType: scope.issueType };
}

function scopeKeyFromScope(scope: SettingsScope): ScopeKey {
  if (scope.level === 'global') {
    return buildScopeKey();
  }
  if (scope.level === 'project') {
    return buildScopeKey(scope.projectKey);
  }
  return buildScopeKey(scope.projectKey, scope.issueType);
}

function cloneScopeSettings(settings: GanttScopeSettings): GanttScopeSettings {
  return JSON.parse(JSON.stringify(settings));
}

/** Defaults when no cascading settings exist yet for the current scope. */
function createDefaultScopeSettings(): GanttScopeSettings {
  return {
    startMapping: { source: 'dateField', fieldId: 'created' },
    endMapping: { source: 'dateField', fieldId: 'duedate' },
    colorRules: [],
    tooltipFieldIds: [],
    exclusionFilters: [],
    hideCompletedTasks: false,
    includeSubtasks: true,
    includeEpicChildren: false,
    includeIssueLinks: false,
    issueLinkTypesToInclude: [],
  };
}

function draftFromResolved(resolved: GanttScopeSettings | null): GanttScopeSettings {
  return resolved !== null ? cloneScopeSettings(resolved) : createDefaultScopeSettings();
}

/**
 * @module GanttSettingsModel
 *
 * Cascading Gantt settings: localStorage persistence, resolution via {@link resolveSettings},
 * modal draft lifecycle, copy-from-scope, status breakdown toggle.
 */
export class GanttSettingsModel {
  storage: GanttSettingsStorage = {};
  currentScope: SettingsScope = { level: 'global' };
  draftSettings: GanttScopeSettings | null = null;
  statusBreakdownEnabled: boolean = false;
  preferredScopeLevel: SettingsScope['level'] | null = null;

  /** Page-level context — always available regardless of selected scope level. */
  contextProjectKey: string = '';
  contextIssueType: string = '';

  constructor(private logger: Logger) {}

  get resolvedSettings(): GanttScopeSettings | null {
    const { projectKey, issueType } = resolveArgsForScope(this.currentScope);
    return resolveSettings(this.storage, projectKey, issueType);
  }

  /** True when at least one scope has saved settings. */
  get isConfigured(): boolean {
    return Object.values(this.storage).some(s => s !== undefined && s !== null);
  }

  load(): void {
    const log = this.logger.getPrefixedLog('GanttSettingsModel.load');
    try {
      const raw = localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY);
      const { storage, statusBreakdownEnabled, preferredScopeLevel } = parseStoredPayload(raw);
      this.storage = storage;
      this.statusBreakdownEnabled = statusBreakdownEnabled;
      this.preferredScopeLevel = preferredScopeLevel;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      log(`Failed to parse ${GANTT_SETTINGS_STORAGE_KEY}: ${message}`, 'error');
      this.storage = {};
      this.statusBreakdownEnabled = false;
      this.preferredScopeLevel = null;
    }
  }

  save(): void {
    const payload: PersistedPayloadV1 = {
      storage: this.storage,
      statusBreakdownEnabled: this.statusBreakdownEnabled,
      preferredScopeLevel: this.currentScope.level,
    };
    localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  }

  /** Direct (non-cascading) settings stored for the current scope, or null. */
  get directSettings(): GanttScopeSettings | null {
    const key = scopeKeyFromScope(this.currentScope);
    return this.storage[key] ?? null;
  }

  setScope(scope: SettingsScope): void {
    this.currentScope = scope;
    if (this.draftSettings !== null) {
      const direct = this.directSettings;
      this.draftSettings = direct !== null ? cloneScopeSettings(direct) : createDefaultScopeSettings();
    }
  }

  setScopeLevel(level: SettingsScope['level']): void {
    if (level === 'global') {
      this.setScope({ level: 'global' });
    } else if (level === 'project') {
      this.setScope({ level: 'project', projectKey: this.contextProjectKey });
    } else {
      this.setScope({
        level: 'projectIssueType',
        projectKey: this.contextProjectKey,
        issueType: this.contextIssueType,
      });
    }
  }

  openDraft(): void {
    const direct = this.directSettings;
    this.draftSettings = direct !== null ? cloneScopeSettings(direct) : createDefaultScopeSettings();
  }

  saveDraft(): void {
    if (this.draftSettings === null) {
      return;
    }
    const key = scopeKeyFromScope(this.currentScope);
    this.storage[key] = cloneScopeSettings(this.draftSettings);
    this.save();
  }

  copyFromScope(sourceKey: ScopeKey): void {
    const source = this.storage[sourceKey];
    if (source === undefined || source === null) {
      return;
    }
    this.draftSettings = cloneScopeSettings(source);
  }

  toggleStatusBreakdown(): void {
    this.statusBreakdownEnabled = !this.statusBreakdownEnabled;
  }

  reset(): void {
    this.storage = {};
    this.currentScope = { level: 'global' };
    this.draftSettings = null;
    this.statusBreakdownEnabled = false;
    this.preferredScopeLevel = null;
  }
}
