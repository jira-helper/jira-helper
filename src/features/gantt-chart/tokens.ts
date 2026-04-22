import { Token } from 'dioma';
import { createModelToken } from 'src/infrastructure/di/Module';
import type { GanttDataModel } from './models/GanttDataModel';
import type { GanttQuickFiltersModel } from './models/GanttQuickFiltersModel';
import type { GanttSettingsModel } from './models/GanttSettingsModel';
import type { GanttViewportModel } from './models/GanttViewportModel';
import type { IIssueViewPageObject } from './page-objects/IssueViewPageObject';

export const ganttSettingsModelToken = createModelToken<GanttSettingsModel>('gantt-chart/settingsModel');
export const ganttDataModelToken = createModelToken<GanttDataModel>('gantt-chart/dataModel');
export const ganttViewportModelToken = createModelToken<GanttViewportModel>('gantt-chart/viewportModel');
export const ganttQuickFiltersModelToken = createModelToken<GanttQuickFiltersModel>('gantt-chart/quickFiltersModel');

export const issueViewPageObjectToken = new Token<IIssueViewPageObject>('gantt-chart/issueViewPageObject');
