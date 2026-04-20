import { Token } from 'dioma';
import { createModelToken } from 'src/shared/di/Module';
import type { GanttDataModel } from './models/GanttDataModel';
import type { GanttSettingsModel } from './models/GanttSettingsModel';
import type { GanttViewportModel } from './models/GanttViewportModel';
import type { IIssueViewPageObject } from './page-objects/IssueViewPageObject';

export const ganttSettingsModelToken = createModelToken<GanttSettingsModel>('gantt-chart/settingsModel');
export const ganttDataModelToken = createModelToken<GanttDataModel>('gantt-chart/dataModel');
export const ganttViewportModelToken = createModelToken<GanttViewportModel>('gantt-chart/viewportModel');

export const issueViewPageObjectToken = new Token<IIssueViewPageObject>('gantt-chart/issueViewPageObject');
