import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/shared/di/Module';
import {
  ganttDataModelToken,
  ganttSettingsModelToken,
  ganttViewportModelToken,
  issueViewPageObjectToken,
} from './tokens';
import { GanttDataModel } from './models/GanttDataModel';
import { GanttSettingsModel } from './models/GanttSettingsModel';
import { GanttViewportModel } from './models/GanttViewportModel';
import { IssueViewPageObject } from './page-objects/IssueViewPageObject';
import { loggerToken } from 'src/shared/Logger';
import { JiraServiceToken } from 'src/shared/jira/jiraService';

class GanttChartModule extends Module {
  register(container: Container): void {
    this.lazy(container, ganttSettingsModelToken, c => modelEntry(new GanttSettingsModel(c.inject(loggerToken))));

    this.lazy(container, ganttDataModelToken, c =>
      modelEntry(new GanttDataModel(c.inject(JiraServiceToken), c.inject(loggerToken)))
    );

    this.lazy(container, ganttViewportModelToken, () => modelEntry(new GanttViewportModel()));

    this.lazy(container, issueViewPageObjectToken, () => new IssueViewPageObject());
  }
}

export const ganttChartModule = new GanttChartModule();
