import type { GanttScopeSettings, GanttSettingsStorage, QuickFilter, SettingsScope, ScopeKey } from '../types';
import { buildScopeKey, resolveSettings } from '../utils/resolveSettings';
import type { Logger } from 'src/infrastructure/logging/Logger';

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
 * Migrates legacy persisted scope settings to the current shape:
 * - `exclusionFilter` (single) → `exclusionFilters` (array)
 * - `startMapping` / `endMapping` (single) → `startMappings` / `endMappings` (priority list of one)
 * - Ensures `hideCompletedTasks` defaults to `false`.
 */
function migrateScope(settings: Record<string, unknown>): void {
  if (settings.exclusionFilter && !settings.exclusionFilters) {
    settings.exclusionFilters = [settings.exclusionFilter];
  }
  if (!Array.isArray(settings.exclusionFilters)) {
    settings.exclusionFilters = [];
  }
  if (!Array.isArray(settings.quickFilters)) {
    settings.quickFilters = [];
  }
  // `hideCompletedTasks` was replaced by the built-in quick filter `builtin:hideCompleted`.
  // We drop it silently — there is effectively no installed user base yet.
  delete settings.hideCompletedTasks;
  delete settings.exclusionFilter;

  if (!Array.isArray(settings.startMappings)) {
    settings.startMappings = settings.startMapping
      ? [settings.startMapping]
      : [{ source: 'dateField', fieldId: 'created' }];
  }
  if (!Array.isArray(settings.endMappings)) {
    settings.endMappings = settings.endMapping ? [settings.endMapping] : [{ source: 'dateField', fieldId: 'duedate' }];
  }
  delete settings.startMapping;
  delete settings.endMapping;
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
  const legacyStorage = parsed as GanttSettingsStorage;
  for (const settings of Object.values(legacyStorage)) {
    if (settings && typeof settings === 'object') {
      migrateScope(settings as unknown as Record<string, unknown>);
    }
  }
  return { storage: legacyStorage, statusBreakdownEnabled: false, preferredScopeLevel: null };
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
    startMappings: [{ source: 'dateField', fieldId: 'created' }],
    endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
    colorRules: [],
    tooltipFieldIds: [],
    exclusionFilters: [],
    quickFilters: [],
    includeSubtasks: true,
    includeEpicChildren: false,
    includeIssueLinks: false,
    issueLinkTypesToInclude: [],
  };
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

  /**
   * Most-specific scope level (across context project / issue type) that has direct settings
   * in storage. Used at page init to seed `currentScope` from the level that already has data.
   */
  get effectiveScopeLevel(): SettingsScope['level'] | null {
    const pk = this.contextProjectKey.trim();
    const it = this.contextIssueType.trim();
    if (pk && it && this.storage[buildScopeKey(pk, it)] != null) return 'projectIssueType';
    if (pk && this.storage[buildScopeKey(pk)] != null) return 'project';
    if (this.storage[buildScopeKey()] != null) return 'global';
    return null;
  }

  /**
   * Variant of {@link effectiveScopeLevel} that resolves against the project/issue type
   * embedded in {@link currentScope}, not the page context. Used by the settings UI to
   * snap the modal scope to the tier that actually feeds {@link resolvedSettings}.
   */
  get effectiveScopeLevelForCurrentScope(): SettingsScope['level'] | null {
    const pk = (this.currentScope.projectKey ?? '').trim();
    const it = (this.currentScope.issueType ?? '').trim();
    if (pk && it && this.storage[buildScopeKey(pk, it)] != null) return 'projectIssueType';
    if (pk && this.storage[buildScopeKey(pk)] != null) return 'project';
    if (this.storage[buildScopeKey()] != null) return 'global';
    return null;
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

  /**
   * Snaps {@link currentScope} to the level whose direct settings are actually feeding
   * {@link resolvedSettings} (cascade source), then refreshes the draft from there.
   *
   * Used when opening the settings UI so the user edits the same tier they see applied
   * to the chart, not whichever tier they happened to leave the segmented control on.
   */
  syncScopeToEffectiveAndOpenDraft(): void {
    const effective = this.effectiveScopeLevelForCurrentScope;
    if (effective !== null && effective !== this.currentScope.level && this.directSettings === null) {
      this.setScopeLevel(effective);
    }
    this.openDraft();
  }

  saveDraft(): void {
    if (this.draftSettings === null) {
      return;
    }
    const key = scopeKeyFromScope(this.currentScope);
    this.storage[key] = cloneScopeSettings(this.draftSettings);
    this.save();
  }

  /**
   * Appends a custom quick filter to the current scope's direct settings, creating a storage row
   * from cascaded {@link resolvedSettings} or defaults when none exist yet (FR-17 Save as chip).
   */
  appendQuickFilterToCurrentScope(qf: QuickFilter): void {
    const direct = this.directSettings;
    const base: GanttScopeSettings =
      direct !== null
        ? cloneScopeSettings(direct)
        : this.resolvedSettings !== null
          ? cloneScopeSettings(this.resolvedSettings)
          : createDefaultScopeSettings();
    base.quickFilters = [...(base.quickFilters ?? []), qf];
    const key = scopeKeyFromScope(this.currentScope);
    this.storage[key] = base;
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
