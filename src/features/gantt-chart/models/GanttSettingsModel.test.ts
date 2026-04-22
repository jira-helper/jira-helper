import { describe, it, expect, beforeEach, vi } from 'vitest';
import { proxy } from 'valtio';
import { Logger } from 'src/infrastructure/logging/Logger';
import type { GanttScopeSettings, GanttSettingsStorage, SettingsScope } from '../types';
import { GANTT_SETTINGS_STORAGE_KEY, GanttSettingsModel } from './GanttSettingsModel';

function scopeSettings(overrides: Partial<GanttScopeSettings> = {}): GanttScopeSettings {
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
    ...overrides,
  };
}

describe('GanttSettingsModel', () => {
  let logger: Logger;

  beforeEach(() => {
    localStorage.clear();
    logger = new Logger();
    logger.setLevel('error');
  });

  function createModel(): GanttSettingsModel {
    return new GanttSettingsModel(logger);
  }

  it('load: restores storage and statusBreakdownEnabled from localStorage', () => {
    const persisted = {
      storage: {
        _global: scopeSettings({ tooltipFieldIds: ['from-disk'] }),
      } as GanttSettingsStorage,
      statusBreakdownEnabled: true,
    };
    localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(persisted));

    const model = createModel();
    model.load();

    expect(model.storage).toEqual(persisted.storage);
    expect(model.statusBreakdownEnabled).toBe(true);
  });

  it('load: treats legacy root object as storage map when no storage field', () => {
    const legacy: GanttSettingsStorage = {
      _global: scopeSettings({ tooltipFieldIds: ['legacy'] }),
    };
    localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(legacy));

    const model = createModel();
    model.load();

    expect(model.storage).toEqual(legacy);
    expect(model.statusBreakdownEnabled).toBe(false);
  });

  it('load: empty localStorage yields empty storage', () => {
    const model = createModel();
    model.load();
    expect(model.storage).toEqual({});
    expect(model.statusBreakdownEnabled).toBe(false);
  });

  it('load: invalid JSON logs and keeps defaults', () => {
    const logSpy = vi.spyOn(logger, 'log');
    localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, '{not json');

    const model = createModel();
    model.load();

    expect(model.storage).toEqual({});
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('save: writes storage and statusBreakdownEnabled', () => {
    const model = createModel();
    model.storage = {
      PROJA: scopeSettings({ tooltipFieldIds: ['saved-proj'] }),
    };
    model.statusBreakdownEnabled = true;
    model.save();

    const parsed = JSON.parse(localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY) ?? '{}');
    expect(parsed.storage.PROJA.tooltipFieldIds).toEqual(['saved-proj']);
    expect(parsed.statusBreakdownEnabled).toBe(true);
  });

  it('isConfigured: false when storage is empty', () => {
    const model = createModel();
    expect(model.isConfigured).toBe(false);
  });

  it('isConfigured: true when any scope has settings', () => {
    const model = createModel();
    model.storage = { PROJA: scopeSettings() };
    expect(model.isConfigured).toBe(true);
  });

  it('resolvedSettings: follows cascade for current scope', () => {
    const model = createModel();
    model.storage = {
      _global: scopeSettings({ tooltipFieldIds: ['g'] }),
      PROJA: scopeSettings({ tooltipFieldIds: ['p'] }),
      'PROJA:Story': scopeSettings({ tooltipFieldIds: ['s'] }),
    };
    model.currentScope = { level: 'projectIssueType', projectKey: 'PROJA', issueType: 'Story' };
    expect(model.resolvedSettings?.tooltipFieldIds).toEqual(['s']);

    model.currentScope = { level: 'project', projectKey: 'PROJA' };
    expect(model.resolvedSettings?.tooltipFieldIds).toEqual(['p']);

    model.currentScope = { level: 'global' };
    expect(model.resolvedSettings?.tooltipFieldIds).toEqual(['g']);
  });

  it('setScope: updates currentScope', () => {
    const model = createModel();
    const scope: SettingsScope = { level: 'project', projectKey: 'PROJA' };
    model.setScope(scope);
    expect(model.currentScope).toEqual(scope);
  });

  it('setScope: when draft is open, refreshes draft from resolved settings', () => {
    const model = createModel();
    model.storage = {
      _global: scopeSettings({ tooltipFieldIds: ['g'] }),
      PROJA: scopeSettings({ tooltipFieldIds: ['p'] }),
    };
    model.currentScope = { level: 'global' };
    model.openDraft();
    expect(model.draftSettings?.tooltipFieldIds).toEqual(['g']);

    model.setScope({ level: 'project', projectKey: 'PROJA' });
    expect(model.draftSettings?.tooltipFieldIds).toEqual(['p']);
  });

  it('openDraft: seeds draft from resolved settings', () => {
    const model = createModel();
    model.storage = { _global: scopeSettings({ tooltipFieldIds: ['global-only'] }) };
    model.currentScope = { level: 'global' };
    model.openDraft();
    expect(model.draftSettings?.tooltipFieldIds).toEqual(['global-only']);
    expect(model.draftSettings).not.toBe(model.resolvedSettings);
  });

  it('openDraft: uses defaults when nothing is resolved', () => {
    const model = createModel();
    model.currentScope = { level: 'project', projectKey: 'PROJA' };
    model.openDraft();
    expect(model.draftSettings?.colorRules).toEqual([]);
    expect(model.draftSettings?.startMappings).toEqual([{ source: 'dateField', fieldId: 'created' }]);
  });

  it('copyFromScope: copies storage entry into draft', () => {
    const model = createModel();
    model.storage = {
      _global: scopeSettings({ tooltipFieldIds: ['g'] }),
      PROJA: scopeSettings({ tooltipFieldIds: ['p'] }),
    };
    model.currentScope = { level: 'global' };
    model.openDraft();
    model.copyFromScope('PROJA');
    expect(model.draftSettings?.tooltipFieldIds).toEqual(['p']);
  });

  it('copyFromScope: no-op when source key is missing', () => {
    const model = createModel();
    model.storage = { _global: scopeSettings({ tooltipFieldIds: ['g'] }) };
    model.openDraft();
    model.copyFromScope('MISSING');
    expect(model.draftSettings?.tooltipFieldIds).toEqual(['g']);
  });

  it('saveDraft: writes draft to storage key for current scope and persists on save', () => {
    const model = createModel();
    model.currentScope = { level: 'project', projectKey: 'PROJA' };
    model.openDraft();
    model.draftSettings = scopeSettings({ tooltipFieldIds: ['draft-label'] });
    model.saveDraft();
    model.save();

    expect(model.storage.PROJA?.tooltipFieldIds).toEqual(['draft-label']);
    const fromDisk = JSON.parse(localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY) ?? '{}');
    expect(fromDisk.storage.PROJA.tooltipFieldIds).toEqual(['draft-label']);
  });

  it('saveDraft: global scope writes to _global', () => {
    const model = createModel();
    model.currentScope = { level: 'global' };
    model.openDraft();
    model.draftSettings = scopeSettings({ tooltipFieldIds: ['glob'] });
    model.saveDraft();
    expect(model.storage._global?.tooltipFieldIds).toEqual(['glob']);
  });

  it('toggleStatusBreakdown: flips flag', () => {
    const model = createModel();
    expect(model.statusBreakdownEnabled).toBe(false);
    model.toggleStatusBreakdown();
    expect(model.statusBreakdownEnabled).toBe(true);
    model.toggleStatusBreakdown();
    expect(model.statusBreakdownEnabled).toBe(false);
  });

  it('works when wrapped with valtio proxy (modelEntry pattern)', () => {
    const model = proxy(new GanttSettingsModel(logger));
    model.storage = { _global: scopeSettings({ tooltipFieldIds: ['x'] }) };
    expect(model.resolvedSettings?.tooltipFieldIds).toEqual(['x']);
  });

  it('save: persists preferredScopeLevel from currentScope.level', () => {
    const model = createModel();
    model.currentScope = { level: 'projectIssueType', projectKey: 'PROJA', issueType: 'Story' };
    model.storage = { 'PROJA:Story': scopeSettings() };
    model.save();

    const fromDisk = JSON.parse(localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY) ?? '{}');
    expect(fromDisk.preferredScopeLevel).toBe('projectIssueType');
  });

  it('load: restores preferredScopeLevel from localStorage', () => {
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: { _global: scopeSettings() },
        statusBreakdownEnabled: false,
        preferredScopeLevel: 'projectIssueType',
      })
    );
    const model = createModel();
    model.load();
    expect(model.preferredScopeLevel).toBe('projectIssueType');
  });

  it('load: defaults preferredScopeLevel to null when not present', () => {
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({ storage: { _global: scopeSettings() }, statusBreakdownEnabled: false })
    );
    const model = createModel();
    model.load();
    expect(model.preferredScopeLevel).toBeNull();
  });

  describe('scope switching', () => {
    it('setScope resets draft to default when new scope has no stored settings', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({ storage: { _global: scopeSettings({ tooltipFieldIds: ['summary'] }) } })
      );
      const model = createModel();
      model.load();
      model.setScope({ level: 'global' });
      model.openDraft();

      expect(model.draftSettings?.tooltipFieldIds).toEqual(['summary']);

      model.setScope({ level: 'project', projectKey: 'PROJ' });

      expect(model.draftSettings?.tooltipFieldIds).toEqual([]);
      expect(model.draftSettings?.startMappings).toEqual([{ source: 'dateField', fieldId: 'created' }]);
    });

    it('setScope loads direct settings when scope has stored settings', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: {
            _global: scopeSettings({ tooltipFieldIds: ['summary'] }),
            PROJ: scopeSettings({ tooltipFieldIds: ['assignee'] }),
          },
        })
      );
      const model = createModel();
      model.load();
      model.setScope({ level: 'global' });
      model.openDraft();

      model.setScope({ level: 'project', projectKey: 'PROJ' });

      expect(model.draftSettings?.tooltipFieldIds).toEqual(['assignee']);
    });

    it('setScope does NOT cascade: project scope does not fall through to global', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({ storage: { _global: scopeSettings({ tooltipFieldIds: ['summary'] }) } })
      );
      const model = createModel();
      model.load();
      model.setScope({ level: 'global' });
      model.openDraft();

      model.setScope({ level: 'project', projectKey: 'PROJ' });

      expect(model.draftSettings?.tooltipFieldIds).toEqual([]);
    });

    it('openDraft loads direct settings for current scope, not cascaded', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({ storage: { _global: scopeSettings({ tooltipFieldIds: ['summary'] }) } })
      );
      const model = createModel();
      model.load();
      model.setScope({ level: 'project', projectKey: 'PROJ' });
      model.openDraft();

      expect(model.draftSettings?.tooltipFieldIds).toEqual([]);
    });

    it('copyFromScope allows copying settings from another scope into the draft', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: {
            _global: scopeSettings({ tooltipFieldIds: ['summary'] }),
            PROJ: scopeSettings({ tooltipFieldIds: ['assignee'] }),
            'OTHER:Bug': scopeSettings({ tooltipFieldIds: ['priority'] }),
          },
        })
      );
      const model = createModel();
      model.load();
      model.setScope({ level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' });
      model.openDraft();

      expect(model.draftSettings?.tooltipFieldIds).toEqual([]);

      model.copyFromScope('_global');
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['summary']);

      model.copyFromScope('PROJ');
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['assignee']);

      model.copyFromScope('OTHER:Bug');
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['priority']);
    });

    it('switching away and back reloads saved settings', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({ storage: { PROJ: scopeSettings({ tooltipFieldIds: ['assignee'] }) } })
      );
      const model = createModel();
      model.load();
      model.setScope({ level: 'project', projectKey: 'PROJ' });
      model.openDraft();

      expect(model.draftSettings?.tooltipFieldIds).toEqual(['assignee']);

      model.setScope({ level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual([]);

      model.setScope({ level: 'project', projectKey: 'PROJ' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['assignee']);
    });
  });

  describe('setScopeLevel', () => {
    it('uses contextProjectKey/contextIssueType when switching levels', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: {
            _global: scopeSettings({ tooltipFieldIds: ['g'] }),
            PROJ: scopeSettings({ tooltipFieldIds: ['p'] }),
            'PROJ:Story': scopeSettings({ tooltipFieldIds: ['pit'] }),
          },
        })
      );
      const model = createModel();
      model.load();
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      model.setScope({ level: 'global' });
      model.openDraft();

      expect(model.draftSettings?.tooltipFieldIds).toEqual(['g']);

      model.setScopeLevel('project');
      expect(model.currentScope).toEqual({ level: 'project', projectKey: 'PROJ' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['p']);

      model.setScopeLevel('projectIssueType');
      expect(model.currentScope).toEqual({ level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['pit']);

      model.setScopeLevel('global');
      expect(model.currentScope).toEqual({ level: 'global' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['g']);
    });

    it('preserves projectKey when switching global → project → global → project', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({ storage: { PROJ: scopeSettings({ tooltipFieldIds: ['proj-data'] }) } })
      );
      const model = createModel();
      model.load();
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Bug';
      model.setScope({ level: 'project', projectKey: 'PROJ' });
      model.openDraft();

      expect(model.draftSettings?.tooltipFieldIds).toEqual(['proj-data']);

      model.setScopeLevel('global');
      expect(model.draftSettings?.tooltipFieldIds).toEqual([]);

      model.setScopeLevel('project');
      expect(model.currentScope).toEqual({ level: 'project', projectKey: 'PROJ' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['proj-data']);
    });
  });

  describe('effectiveScopeLevel (page-context resolution)', () => {
    it('returns null when storage is empty', () => {
      const model = createModel();
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      expect(model.effectiveScopeLevel).toBeNull();
    });

    it('returns "global" when only _global has settings', () => {
      const model = createModel();
      model.storage = { _global: scopeSettings() };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      expect(model.effectiveScopeLevel).toBe('global');
    });

    it('returns "project" when project has settings (preferred over global)', () => {
      const model = createModel();
      model.storage = {
        _global: scopeSettings(),
        PROJ: scopeSettings(),
      };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      expect(model.effectiveScopeLevel).toBe('project');
    });

    it('returns "projectIssueType" when the most specific scope has settings', () => {
      const model = createModel();
      model.storage = {
        _global: scopeSettings(),
        PROJ: scopeSettings(),
        'PROJ:Story': scopeSettings(),
      };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      expect(model.effectiveScopeLevel).toBe('projectIssueType');
    });

    it('falls back to project when projectIssueType row exists for a different issue type', () => {
      const model = createModel();
      model.storage = {
        PROJ: scopeSettings(),
        'PROJ:Bug': scopeSettings(),
      };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      expect(model.effectiveScopeLevel).toBe('project');
    });
  });

  describe('effectiveScopeLevelForCurrentScope (UI snap target)', () => {
    it('uses currentScope project/issueType, not page context', () => {
      const model = createModel();
      model.storage = { 'PROJB:Bug': scopeSettings() };
      model.contextProjectKey = 'PROJA';
      model.contextIssueType = 'Story';
      model.currentScope = { level: 'projectIssueType', projectKey: 'PROJB', issueType: 'Bug' };
      expect(model.effectiveScopeLevelForCurrentScope).toBe('projectIssueType');
    });
  });

  describe('syncScopeToEffectiveAndOpenDraft (settings modal entry)', () => {
    it('snaps Project+IssueType down to Project when current scope has no direct settings', () => {
      const model = createModel();
      model.storage = {
        _global: scopeSettings({ tooltipFieldIds: ['g'] }),
        PROJ: scopeSettings({ tooltipFieldIds: ['proj-applied'] }),
      };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      // Simulate stale preferred level after a previous session.
      model.currentScope = { level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' };

      model.syncScopeToEffectiveAndOpenDraft();

      expect(model.currentScope).toEqual({ level: 'project', projectKey: 'PROJ' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['proj-applied']);
    });

    it('keeps current scope when it already has direct settings', () => {
      const model = createModel();
      model.storage = {
        PROJ: scopeSettings(),
        'PROJ:Story': scopeSettings({ tooltipFieldIds: ['pit-applied'] }),
      };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      model.currentScope = { level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' };

      model.syncScopeToEffectiveAndOpenDraft();

      expect(model.currentScope).toEqual({ level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['pit-applied']);
    });

    it('does not snap when no scope has settings (first-run); opens defaults instead', () => {
      const model = createModel();
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      model.currentScope = { level: 'project', projectKey: 'PROJ' };

      model.syncScopeToEffectiveAndOpenDraft();

      expect(model.currentScope).toEqual({ level: 'project', projectKey: 'PROJ' });
      expect(model.draftSettings?.startMappings).toEqual([{ source: 'dateField', fieldId: 'created' }]);
    });

    it('snaps from Project down to Global when only _global has settings', () => {
      const model = createModel();
      model.storage = { _global: scopeSettings({ tooltipFieldIds: ['g-applied'] }) };
      model.contextProjectKey = 'PROJ';
      model.contextIssueType = 'Story';
      model.currentScope = { level: 'project', projectKey: 'PROJ' };

      model.syncScopeToEffectiveAndOpenDraft();

      expect(model.currentScope).toEqual({ level: 'global' });
      expect(model.draftSettings?.tooltipFieldIds).toEqual(['g-applied']);
    });
  });

  describe('multi-mapping migration', () => {
    it('migrates legacy single startMapping/endMapping to startMappings/endMappings arrays', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: {
            _global: {
              startMapping: { source: 'dateField', fieldId: 'created' },
              endMapping: { source: 'statusTransition', statusName: 'Done' },
              colorRules: [],
              tooltipFieldIds: [],
              exclusionFilters: [],
              hideCompletedTasks: false,
              includeSubtasks: true,
              includeEpicChildren: false,
              includeIssueLinks: false,
              issueLinkTypesToInclude: [],
            },
          },
        })
      );
      const model = createModel();
      model.load();
      const resolved = model.resolvedSettings;
      expect(resolved?.startMappings).toEqual([{ source: 'dateField', fieldId: 'created' }]);
      expect(resolved?.endMappings).toEqual([{ source: 'statusTransition', statusName: 'Done' }]);
      expect((resolved as unknown as { startMapping?: unknown; endMapping?: unknown }).startMapping).toBeUndefined();
      expect((resolved as unknown as { startMapping?: unknown; endMapping?: unknown }).endMapping).toBeUndefined();
    });

    it('seeds default arrays when neither legacy nor new mappings are present', () => {
      localStorage.setItem(
        GANTT_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          storage: {
            _global: {
              colorRules: [],
              tooltipFieldIds: [],
              exclusionFilters: [],
              hideCompletedTasks: false,
              includeSubtasks: true,
              includeEpicChildren: false,
              includeIssueLinks: false,
              issueLinkTypesToInclude: [],
            },
          },
        })
      );
      const model = createModel();
      model.load();
      const resolved = model.resolvedSettings;
      expect(resolved?.startMappings).toEqual([{ source: 'dateField', fieldId: 'created' }]);
      expect(resolved?.endMappings).toEqual([{ source: 'dateField', fieldId: 'duedate' }]);
    });

    it('preserves multi-mapping arrays already in current shape', () => {
      const persisted = {
        storage: {
          _global: {
            startMappings: [{ source: 'dateField', fieldId: 'startDate' }],
            endMappings: [
              { source: 'dateField', fieldId: 'duedate' },
              { source: 'statusTransition', statusName: 'Done' },
            ],
            colorRules: [],
            tooltipFieldIds: [],
            exclusionFilters: [],
            hideCompletedTasks: false,
            includeSubtasks: true,
            includeEpicChildren: false,
            includeIssueLinks: false,
            issueLinkTypesToInclude: [],
          },
        },
      };
      localStorage.setItem(GANTT_SETTINGS_STORAGE_KEY, JSON.stringify(persisted));

      const model = createModel();
      model.load();
      const resolved = model.resolvedSettings;
      expect(resolved?.startMappings).toEqual(persisted.storage._global.startMappings);
      expect(resolved?.endMappings).toEqual(persisted.storage._global.endMappings);
    });
  });

  describe('appendQuickFilterToCurrentScope', () => {
    it('creates direct row from resolved cascade when current scope has no direct entry', () => {
      const model = createModel();
      model.storage = {
        _global: scopeSettings({
          quickFilters: [{ id: 'old', name: 'Old', selector: { mode: 'jql', jql: 'x' } }],
        }),
      };
      model.currentScope = { level: 'project', projectKey: 'PROJA' };
      const qf = { id: 'new', name: 'New', selector: { mode: 'jql' as const, jql: 'y' } };
      model.appendQuickFilterToCurrentScope(qf);
      expect(model.storage.PROJA).toBeDefined();
      expect(model.storage.PROJA?.quickFilters).toEqual([
        { id: 'old', name: 'Old', selector: { mode: 'jql', jql: 'x' } },
        qf,
      ]);
    });

    it('appends to existing direct quickFilters for the current scope', () => {
      const model = createModel();
      const existing = { id: 'a', name: 'A', selector: { mode: 'jql' as const, jql: 'a' } };
      model.storage = { PROJA: scopeSettings({ quickFilters: [existing] }) };
      model.currentScope = { level: 'project', projectKey: 'PROJA' };
      const qf = { id: 'b', name: 'B', selector: { mode: 'jql' as const, jql: 'b' } };
      model.appendQuickFilterToCurrentScope(qf);
      expect(model.storage.PROJA?.quickFilters).toEqual([existing, qf]);
    });

    it('writes through to localStorage via save()', () => {
      const model = createModel();
      model.storage = { _global: scopeSettings() };
      model.currentScope = { level: 'global' };
      const qf = { id: 'x', name: 'X', selector: { mode: 'jql' as const, jql: 'project = X' } };
      model.appendQuickFilterToCurrentScope(qf);
      const fromDisk = JSON.parse(localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY) ?? '{}');
      expect(fromDisk.storage._global.quickFilters).toContainEqual(qf);
    });

    it('uses project+issueType storage key when scope level is projectIssueType', () => {
      const model = createModel();
      model.storage = { _global: scopeSettings() };
      model.currentScope = { level: 'projectIssueType', projectKey: 'PROJ', issueType: 'Story' };
      const qf = { id: 'pit', name: 'PIT', selector: { mode: 'jql' as const, jql: 'z' } };
      model.appendQuickFilterToCurrentScope(qf);
      expect(model.storage['PROJ:Story']?.quickFilters).toEqual([qf]);
    });
  });

  it('load: migrates legacy exclusionFilter to exclusionFilters', () => {
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: {
          _global: {
            startMapping: { source: 'dateField', fieldId: 'created' },
            endMapping: { source: 'dateField', fieldId: 'duedate' },
            colorRules: [],
            tooltipFieldIds: [],
            exclusionFilter: { mode: 'field', fieldId: 'status', value: 'Done' },
            includeSubtasks: true,
            includeEpicChildren: false,
            includeIssueLinks: false,
            issueLinkTypesToInclude: [],
          },
        },
      })
    );
    const model = createModel();
    model.load();
    const resolved = model.resolvedSettings;
    expect(resolved?.exclusionFilters).toEqual([{ mode: 'field', fieldId: 'status', value: 'Done' }]);
    expect(resolved?.hideCompletedTasks).toBeUndefined();
    expect(resolved?.quickFilters).toEqual([]);
  });
});
