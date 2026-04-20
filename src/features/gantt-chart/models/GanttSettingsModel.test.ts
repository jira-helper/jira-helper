import { describe, it, expect, beforeEach, vi } from 'vitest';
import { proxy } from 'valtio';
import { Logger } from 'src/shared/Logger';
import type { GanttScopeSettings, GanttSettingsStorage, SettingsScope } from '../types';
import { GANTT_SETTINGS_STORAGE_KEY, GanttSettingsModel } from './GanttSettingsModel';

function scopeSettings(overrides: Partial<GanttScopeSettings> = {}): GanttScopeSettings {
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
    expect(model.draftSettings?.startMapping).toEqual({ source: 'dateField', fieldId: 'created' });
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
      expect(model.draftSettings?.startMapping).toEqual({ source: 'dateField', fieldId: 'created' });
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
    expect(resolved?.hideCompletedTasks).toBe(false);
  });
});
