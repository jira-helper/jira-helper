import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import {
  ganttDataModelToken,
  ganttQuickFiltersModelToken,
  ganttSettingsModelToken,
  ganttViewportModelToken,
  issueViewPageObjectToken,
} from './tokens';
import { GanttDataModel } from './models/GanttDataModel';
import { GanttQuickFiltersModel } from './models/GanttQuickFiltersModel';
import { GanttSettingsModel } from './models/GanttSettingsModel';
import { GanttViewportModel } from './models/GanttViewportModel';
import { IssueViewPageObject } from 'src/infrastructure/page-objects/IssueViewPageObject';
import { loggerToken } from 'src/infrastructure/logging/Logger';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';

class GanttChartModule extends Module {
  register(container: Container): void {
    this.lazy(container, ganttSettingsModelToken, c => modelEntry(new GanttSettingsModel(c.inject(loggerToken))));

    this.lazy(container, ganttDataModelToken, c =>
      modelEntry(new GanttDataModel(c.inject(JiraServiceToken), c.inject(loggerToken)))
    );

    this.lazy(container, ganttViewportModelToken, () => modelEntry(new GanttViewportModel()));

    this.lazy(container, ganttQuickFiltersModelToken, () => modelEntry(new GanttQuickFiltersModel()));

    this.lazy(container, issueViewPageObjectToken, () => new IssueViewPageObject());

    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    const { model: settingsModel } = container.inject(ganttSettingsModelToken);
    const { model: dataModel } = container.inject(ganttDataModelToken);
    const { model: quickFiltersModel } = container.inject(ganttQuickFiltersModelToken);
    const { model: viewportModel } = container.inject(ganttViewportModelToken);

    diagnosticModel.registerDiagnosticData(
      'gantt-chart',
      (): Result<FeatureDiagnosticData, Error> =>
        Ok({
          settings: {
            boardProperty: null,
            localStorage: settingsModel.getDiagnosticSnapshot(),
          },
          runtime: {
            dataModel: dataModel.getDiagnosticSnapshot(),
            quickFilters: quickFiltersModel.getDiagnosticSnapshot(),
            viewport: viewportModel.getDiagnosticSnapshot(),
          },
        })
    );
  }
}

export const ganttChartModule = new GanttChartModule();
