import { describe, it, expect } from 'vitest';
import type { GanttScopeSettings, GanttSettingsStorage } from '../types';
import { buildScopeKey, resolveSettings } from './resolveSettings';

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

describe('buildScopeKey', () => {
  it('returns _global when projectKey is omitted', () => {
    expect(buildScopeKey()).toBe('_global');
  });

  it('returns _global when projectKey is empty or whitespace', () => {
    expect(buildScopeKey('')).toBe('_global');
    expect(buildScopeKey('   ')).toBe('_global');
  });

  it('ignores issueType without projectKey (incomplete key)', () => {
    expect(buildScopeKey(undefined, 'Story')).toBe('_global');
    expect(buildScopeKey('', 'Story')).toBe('_global');
  });

  it('returns project key when only projectKey is set', () => {
    expect(buildScopeKey('PROJA')).toBe('PROJA');
  });

  it('returns compound key for project + issue type', () => {
    expect(buildScopeKey('PROJECT-A', 'Story')).toBe('PROJECT-A:Story');
  });

  it('trims project key and issue type', () => {
    expect(buildScopeKey('  PROJA  ', '  Bug  ')).toBe('PROJA:Bug');
  });
});

describe('resolveSettings', () => {
  it('returns null when storage is empty', () => {
    const storage: GanttSettingsStorage = {};
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBeNull();
  });

  it('returns null when no level matches (no _global and no project keys)', () => {
    const storage: GanttSettingsStorage = {
      OTHER: scopeSettings({ tooltipFieldIds: ['x'] }),
    };
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBeNull();
  });

  it('uses only _global when present and no project overrides', () => {
    const global = scopeSettings({ tooltipFieldIds: ['global-label'] });
    const storage: GanttSettingsStorage = { _global: global };
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBe(global);
  });

  it('prefers project override over _global', () => {
    const global = scopeSettings({ tooltipFieldIds: ['global-label'] });
    const project = scopeSettings({ tooltipFieldIds: ['project-label'] });
    const storage: GanttSettingsStorage = {
      _global: global,
      PROJA: project,
    };
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBe(project);
  });

  it('prefers project+issueType over project and _global', () => {
    const global = scopeSettings({ tooltipFieldIds: ['g'] });
    const project = scopeSettings({ tooltipFieldIds: ['p'] });
    const specific = scopeSettings({ tooltipFieldIds: ['s'] });
    const storage: GanttSettingsStorage = {
      _global: global,
      PROJA: project,
      'PROJA:Story': specific,
    };
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBe(specific);
  });

  it('falls back from project+issueType to project when specific key missing', () => {
    const project = scopeSettings({ tooltipFieldIds: ['project-only'] });
    const storage: GanttSettingsStorage = {
      PROJA: project,
    };
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBe(project);
  });

  it('falls back to _global when issue type does not match any project+issueType key', () => {
    const global = scopeSettings({ tooltipFieldIds: ['from-global'] });
    const storage: GanttSettingsStorage = {
      _global: global,
      'PROJA:Task': scopeSettings({ tooltipFieldIds: ['task'] }),
    };
    expect(resolveSettings(storage, 'PROJA', 'Story')).toBe(global);
  });

  it('skips project+issueType tier when issueType is omitted', () => {
    const project = scopeSettings({ tooltipFieldIds: ['proj'] });
    const specific = scopeSettings({ tooltipFieldIds: ['spec'] });
    const storage: GanttSettingsStorage = {
      PROJA: project,
      'PROJA:Story': specific,
    };
    expect(resolveSettings(storage, 'PROJA')).toBe(project);
  });

  it('only considers _global when projectKey is empty (incomplete context)', () => {
    const global = scopeSettings({ tooltipFieldIds: ['g'] });
    const storage: GanttSettingsStorage = {
      _global: global,
      PROJA: scopeSettings({ tooltipFieldIds: ['p'] }),
    };
    expect(resolveSettings(storage, '', 'Story')).toBe(global);
  });
});
