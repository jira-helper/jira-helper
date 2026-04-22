import type { Container } from 'dioma';
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
import { IssueViewPageObject } from './page-objects/IssueViewPageObject';
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
  }
}

export const ganttChartModule = new GanttChartModule();
