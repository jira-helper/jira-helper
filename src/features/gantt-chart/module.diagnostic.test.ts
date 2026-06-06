import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { ganttChartModule } from './module';
import {
  ganttDataModelToken,
  ganttQuickFiltersModelToken,
  ganttSettingsModelToken,
  ganttViewportModelToken,
} from './tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { registerJiraServiceInDI } from 'src/infrastructure/jira/jiraService';
import { GANTT_SETTINGS_STORAGE_KEY } from './models/GanttSettingsModel';

describe('ganttChartModule diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    registerJiraServiceInDI(container);
    diagnosticModule.ensure(container);
    ganttChartModule.ensure(container);
  });

  it('registers gantt-chart diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('gantt-chart');
  });

  it('returns §5.3 payload from current model state without side effects', () => {
    const { model: settingsModel } = container.inject(ganttSettingsModelToken);
    const { model: dataModel } = container.inject(ganttDataModelToken);
    const { model: quickFiltersModel } = container.inject(ganttQuickFiltersModelToken);
    const { model: viewportModel } = container.inject(ganttViewportModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    settingsModel.featureEnabled = false;
    settingsModel.statusBreakdownEnabled = true;
    settingsModel.currentScope = { level: 'project', projectKey: 'PROJ' };
    dataModel.loadingState = 'loaded';
    dataModel.bars = [];
    quickFiltersModel.activeIds = ['builtin:hideCompleted'];
    quickFiltersModel.searchQuery = 'foo';
    viewportModel.setZoomLevel(2);

    const loadSpy = vi.spyOn(settingsModel, 'load');
    const loadSubtasksSpy = vi.spyOn(dataModel, 'loadSubtasks');
    const recomputeSpy = vi.spyOn(dataModel, 'recompute');
    const settingsSnapshotSpy = vi.spyOn(settingsModel, 'getDiagnosticSnapshot');
    const dataSnapshotSpy = vi.spyOn(dataModel, 'getDiagnosticSnapshot');
    const quickFiltersSnapshotSpy = vi.spyOn(quickFiltersModel, 'getDiagnosticSnapshot');
    const viewportSnapshotSpy = vi.spyOn(viewportModel, 'getDiagnosticSnapshot');

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['gantt-chart'];

    expect(loadSpy).not.toHaveBeenCalled();
    expect(loadSubtasksSpy).not.toHaveBeenCalled();
    expect(recomputeSpy).not.toHaveBeenCalled();
    expect(settingsSnapshotSpy).toHaveBeenCalled();
    expect(dataSnapshotSpy).toHaveBeenCalled();
    expect(quickFiltersSnapshotSpy).toHaveBeenCalled();
    expect(viewportSnapshotSpy).toHaveBeenCalled();

    expect(payload).toEqual({
      settings: {
        boardProperty: null,
        localStorage: settingsModel.getDiagnosticSnapshot(),
      },
      runtime: {
        dataModel: dataModel.getDiagnosticSnapshot(),
        quickFilters: quickFiltersModel.getDiagnosticSnapshot(),
        viewport: viewportModel.getDiagnosticSnapshot(),
      },
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('includes storage key in settings snapshot', () => {
    const { model: settingsModel } = container.inject(ganttSettingsModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['gantt-chart'];

    expect(payload).toBeDefined();
    if (payload === undefined || 'error' in payload) {
      expect.fail('expected gantt-chart diagnostic data');
    }

    expect(payload).toMatchObject({
      settings: {
        localStorage: {
          storageKey: GANTT_SETTINGS_STORAGE_KEY,
        },
      },
    });
    expect(settingsModel.getDiagnosticSnapshot().storageKey).toBe(GANTT_SETTINGS_STORAGE_KEY);
  });
});
