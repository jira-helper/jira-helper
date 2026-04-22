import { beforeEach, describe, expect, it } from 'vitest';
import { Logger } from 'src/infrastructure/logging/Logger';
import { GANTT_SETTINGS_STORAGE_KEY, GanttSettingsModel } from '../models/GanttSettingsModel';
import { buildScopeKey } from './resolveSettings';
import { applyInitialGanttScopeForIssueView } from './applyInitialGanttScopeForIssueView';
import type { GanttScopeSettings } from '../types';

const emptyScope = (over: Partial<GanttScopeSettings> = {}): GanttScopeSettings => ({
  startMappings: [],
  endMappings: [],
  colorRules: [],
  tooltipFieldIds: [],
  exclusionFilters: [],
  hideCompletedTasks: false,
  includeSubtasks: true,
  includeEpicChildren: false,
  includeIssueLinks: false,
  issueLinkTypesToInclude: [],
  ...over,
});

describe('applyInitialGanttScopeForIssueView', () => {
  const logger = new Logger();
  let model: GanttSettingsModel;

  beforeEach(() => {
    localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
    logger.setLevel('error');
    model = new GanttSettingsModel(logger);
  });

  it('selects global when storage has _global and context is set', () => {
    const key = buildScopeKey();
    localStorage.setItem(
      GANTT_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        storage: { [key]: emptyScope() },
        statusBreakdownEnabled: false,
      })
    );
    model.load();
    model.contextProjectKey = 'PROJ';
    model.contextIssueType = 'Story';
    applyInitialGanttScopeForIssueView(model);
    expect(model.currentScope).toEqual({ level: 'global' });
  });

  it('selects global when no storage keys match and preferred is null', () => {
    model.load();
    model.contextProjectKey = 'PROJ';
    model.contextIssueType = 'Story';
    applyInitialGanttScopeForIssueView(model);
    expect(model.currentScope).toEqual({ level: 'global' });
  });
});
