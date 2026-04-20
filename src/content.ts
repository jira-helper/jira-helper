import './firefoxFixes';
import { globalContainer } from 'dioma';
import { setAutoFreeze } from 'immer';
import { Routes, routingServiceToken } from './infrastructure/routing';
import { isJira } from './shared/utils';
import AddSlaLine, { addSlaLineToken } from './features/charts/AddSlaLine';
import AddChartGrid, { addChartGridToken } from './features/charts/AddChartGrid';
import runModifications from './infrastructure/page-modification/runModifications';
import {
  BoardPageModification as SwimlaneLimitsBoardPage,
  swimlaneWipLimitsBoardPageToken,
} from './features/swimlane-wip-limits-module/BoardPage';
import {
  SettingsPageModification as SwimlaneLimitsSettingsPage,
  swimlaneWipLimitsSettingsPageToken,
} from './features/swimlane-wip-limits-module/SettingsPage';
import {
  HistogramModification as SwimlaneHistogramBoardPage,
  histogramModificationToken,
} from './features/swimlane-histogram-module';
import WIPLimitsSettingsPage, { columnLimitsSettingsPageToken } from './features/column-limits-module/SettingsPage';
import WIPLimitsBoardPage, { columnLimitsBoardPageToken } from './features/column-limits-module/BoardPage';
import BugTemplate, { bugTemplateToken } from './features/bug-template/BugTemplate';
import MarkFlaggedIssues, { markFlaggedIssuesToken } from './features/issue/MarkFlaggedIssues';
import ToggleForRightSidebar, { toggleForRightSidebarToken } from './features/issue/ToggleForRightSidebar';
import {
  SettingsPageModification as FieldLimitsSettingsPage,
  fieldLimitsSettingsPageToken,
} from './features/field-limits-module/SettingsPage';
import {
  BoardPageModification as FieldLimitsBoardPage,
  fieldLimitsBoardPageToken,
} from './features/field-limits-module/BoardPage';
import { blurSensitiveFeatureToken, registerBlurSensitiveFeatureInDI } from './features/blur-for-sensitive';
import PersonLimitsSettings, { personLimitsSettingsPageToken } from './features/person-limits-module/SettingsPage';
import PersonLimits, { personLimitsBoardPageToken } from './features/person-limits-module/BoardPage';
import WiplimitOnCells, { wipLimitOnCellsBoardPageToken } from './features/wiplimit-on-cells/BoardPage';
import WiplimitOnCellsSettings, { wipLimitOnCellsSettingsPageToken } from './features/wiplimit-on-cells/SettingsPage';
import { CardColorsBoardPage, cardColorsBoardPageToken } from './features/card-colors-module/BoardPage';
import CardColorsSettingsPage, { cardColorsSettingsPageToken } from './features/card-colors-module/SettingsPage';
import { BoardSettingsBoardPage, boardSettingsBoardPageToken } from './features/board-settings/BoardPage';
import { SubTasksProgressBoardPage, subTasksProgressBoardPageToken } from './features/sub-tasks-progress/BoardPage';
import { registerBoardPagePageObjectInDI } from './infrastructure/page-objects/BoardPage';
import { registerSettingsPagePageObjectInDI } from './infrastructure/page-objects/SettingsPage';
import { registerBoardPropertyServiceInDI } from './infrastructure/jira/boardPropertyService';
import { registerJiraServiceInDI } from './infrastructure/jira/jiraService';
import { registerLogger } from './infrastructure/logging/Logger';
import { registerRoutingInDI } from './infrastructure/di/routingTokens';
import { registerRoutingServiceInDI } from './infrastructure/routing';
import { registerJiraApiInDI } from './infrastructure/di/jiraApiTokens';
import { registerIssueTypeServiceInDI } from './shared/issueType';
import { localeProviderToken, JiraLocaleProvider } from './shared/locale';
import { columnLimitsModule } from './features/column-limits-module/module';
import { personLimitsModule } from './features/person-limits-module/module';
import { swimlaneWipLimitsModule } from './features/swimlane-wip-limits-module/module';
import { fieldLimitsModule } from './features/field-limits-module/module';
import { swimlaneHistogramModule } from './features/swimlane-histogram-module/module';
import { cardColorsModule } from './features/card-colors-module/module';
import { ganttChartModule } from './features/gantt-chart/module';
import { GanttChartIssuePage, ganttChartIssuePageToken } from './features/gantt-chart/IssuePage/GanttChartIssuePage';
import { DiagnosticBoardPage, diagnosticBoardPageToken } from './features/diagnostic/BoardPage';
import { LocalSettingsBoardPage, localSettingsBoardPageToken } from './features/local-settings/BoardPage';
import { loadLocalSettings } from './features/local-settings/actions/loadLocalSettings';
import {
  extensionApiServiceToken,
  registerExtensionApiServiceInDI,
} from './infrastructure/extension-api/ExtensionApiService';
import {
  AdditionalCardElementsBoardPage,
  additionalCardElementsBoardPageToken,
} from './features/additional-card-elements/BoardPage';
import {
  AdditionalCardElementsBoardBacklogPage,
  additionalCardElementsBoardBacklogPageToken,
} from './features/additional-card-elements/BoardBacklogPage';

setAutoFreeze(false);

const domLoaded = () =>
  new Promise(resolve => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') return resolve(undefined);
    window.addEventListener('DOMContentLoaded', resolve);
  });

function initDiContainer() {
  const container = globalContainer;
  registerExtensionApiServiceInDI(container);
  registerBlurSensitiveFeatureInDI(container);
  registerBoardPagePageObjectInDI(container);
  registerSettingsPagePageObjectInDI(container);
  registerBoardPropertyServiceInDI(container);
  registerJiraServiceInDI(container);
  registerLogger(container);
  registerRoutingServiceInDI(container);
  registerRoutingInDI(container);
  registerJiraApiInDI(container);
  registerIssueTypeServiceInDI(container);
  container.register({
    token: localeProviderToken,
    value: new JiraLocaleProvider(),
  });

  columnLimitsModule.ensure(container);
  personLimitsModule.ensure(container);
  swimlaneWipLimitsModule.ensure(container);
  fieldLimitsModule.ensure(container);
  swimlaneHistogramModule.ensure(container);
  cardColorsModule.ensure(container);
  ganttChartModule.ensure(container);

  // Register PageModification instances as value tokens
  container.register({ token: cardColorsBoardPageToken, value: new CardColorsBoardPage(container) });
  container.register({ token: columnLimitsBoardPageToken, value: new WIPLimitsBoardPage(container) });
  container.register({ token: personLimitsBoardPageToken, value: new PersonLimits(container) });
  container.register({ token: wipLimitOnCellsBoardPageToken, value: new WiplimitOnCells(container) });
  container.register({ token: swimlaneWipLimitsBoardPageToken, value: new SwimlaneLimitsBoardPage(container) });
  container.register({ token: histogramModificationToken, value: new SwimlaneHistogramBoardPage(container) });
  container.register({ token: fieldLimitsBoardPageToken, value: new FieldLimitsBoardPage(container) });
  container.register({ token: subTasksProgressBoardPageToken, value: new SubTasksProgressBoardPage(container) });
  container.register({
    token: additionalCardElementsBoardPageToken,
    value: new AdditionalCardElementsBoardPage(container),
  });
  container.register({
    token: additionalCardElementsBoardBacklogPageToken,
    value: new AdditionalCardElementsBoardBacklogPage(container),
  });
  container.register({ token: diagnosticBoardPageToken, value: new DiagnosticBoardPage(container) });
  container.register({ token: localSettingsBoardPageToken, value: new LocalSettingsBoardPage(container) });
  container.register({ token: boardSettingsBoardPageToken, value: new BoardSettingsBoardPage(container) });

  container.register({ token: cardColorsSettingsPageToken, value: new CardColorsSettingsPage(container) });
  container.register({ token: columnLimitsSettingsPageToken, value: new WIPLimitsSettingsPage(container) });
  container.register({ token: personLimitsSettingsPageToken, value: new PersonLimitsSettings(container) });
  container.register({ token: wipLimitOnCellsSettingsPageToken, value: new WiplimitOnCellsSettings(container) });
  container.register({
    token: swimlaneWipLimitsSettingsPageToken,
    value: new SwimlaneLimitsSettingsPage(container),
  });
  container.register({ token: fieldLimitsSettingsPageToken, value: new FieldLimitsSettingsPage(container) });

  container.register({ token: markFlaggedIssuesToken, value: new MarkFlaggedIssues(container) });
  container.register({ token: ganttChartIssuePageToken, value: new GanttChartIssuePage(container) });
  container.register({ token: toggleForRightSidebarToken, value: new ToggleForRightSidebar(container) });
  container.register({ token: addSlaLineToken, value: new AddSlaLine(container) });
  container.register({ token: addChartGridToken, value: new AddChartGrid(container) });
  container.register({ token: bugTemplateToken, value: new BugTemplate(container) });
}

async function start() {
  if (!isJira) return;

  initDiContainer();

  const container = globalContainer;

  const blurFeature = container.inject(blurSensitiveFeatureToken);
  blurFeature.init();
  const extensionApi = container.inject(extensionApiServiceToken);
  extensionApi.sendMessage({ message: 'jira-helper-inited' });

  await domLoaded();

  loadLocalSettings();

  blurFeature.setUpOnPage();

  const modificationsMap = {
    [Routes.BOARD]: [
      container.inject(histogramModificationToken),
      container.inject(personLimitsBoardPageToken),
      container.inject(columnLimitsBoardPageToken),
      container.inject(swimlaneWipLimitsBoardPageToken),
      container.inject(markFlaggedIssuesToken),
      container.inject(fieldLimitsBoardPageToken),
      container.inject(wipLimitOnCellsBoardPageToken),
      container.inject(cardColorsBoardPageToken),
      container.inject(boardSettingsBoardPageToken),
      container.inject(subTasksProgressBoardPageToken),
      container.inject(localSettingsBoardPageToken),
      container.inject(diagnosticBoardPageToken),
      container.inject(additionalCardElementsBoardPageToken),
    ],
    [Routes.BOARD_BACKLOG]: [container.inject(additionalCardElementsBoardBacklogPageToken)],
    [Routes.SETTINGS]: [
      container.inject(swimlaneWipLimitsSettingsPageToken),
      container.inject(columnLimitsSettingsPageToken),
      container.inject(personLimitsSettingsPageToken),
      container.inject(fieldLimitsSettingsPageToken),
      container.inject(wipLimitOnCellsSettingsPageToken),
      container.inject(cardColorsSettingsPageToken),
    ],
    [Routes.ISSUE]: [
      container.inject(markFlaggedIssuesToken),
      container.inject(ganttChartIssuePageToken),
      container.inject(toggleForRightSidebarToken),
    ],
    [Routes.SEARCH]: [container.inject(markFlaggedIssuesToken), container.inject(toggleForRightSidebarToken)],
    [Routes.REPORTS]: [container.inject(addSlaLineToken), container.inject(addChartGridToken)],
    [Routes.ALL]: [container.inject(bugTemplateToken)],
  };

  const routingService = container.inject(routingServiceToken);
  runModifications(modificationsMap, routingService);
}

start();
