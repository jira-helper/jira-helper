import './firefoxFixes';
import { globalContainer } from 'dioma';
import { setAutoFreeze } from 'immer';
import { Routes } from './routing';
import { isJira } from './shared/utils';
import AddSlaLine from './charts/AddSlaLine';
import AddChartGrid from './charts/AddChartGrid';
import runModifications from './shared/runModifications';
import SwimlaneStats from './swimlane/SwimlaneStats';
import SwimlaneLimits from './swimlane/SwimlaneLimits';
import SwimlaneSettingsPopup from './swimlane/SwimlaneSettingsPopup';
import WIPLimitsSettingsPage from './column-limits/SettingsPage';
import WIPLimitsBoardPage from './column-limits/BoardPage';
import BugTemplate from './bug-template/BugTemplate';
import MarkFlaggedIssues from './issue/MarkFlaggedIssues';
import ToggleForRightSidebar from './issue/ToggleForRightSidebar';
import FieldLimitsSettingsPage from './field-limits/SettingsPage';
import FieldLimitsBoardPage from './field-limits/BoardPage';
import { setUpBlurSensitiveOnPage, initBlurSensitive } from './blur-for-sensitive/blurSensitive';
import PersonLimitsSettings from './person-limits/SettingsPage';
import PersonLimits from './person-limits/BoardPage';
import WiplimitOnCells from './wiplimit-on-cells/BoardPage';
import WiplimitOnCellsSettings from './wiplimit-on-cells/SettingsPage';
import { SettingsPage } from './page-objects/SettingsPage';
import CardColorsSettingsPage from './card-colors/SettingsPage';
import { CardColorsBoardPage } from './card-colors/BoardPage';
import { BoardSettingsBoardPage } from './board-settings/BoardPage';
import { SubTasksProgressBoardPage } from './features/sub-tasks-progress/BoardPage';
import { registerBoardPagePageObjectInDI } from './page-objects/BoardPage';
import { registerBoardPropertyServiceInDI } from './shared/boardPropertyService';
import { registerJiraServiceInDI } from './shared/jira/jiraService';
import { registerLogger } from './shared/Logger';
import { registerRoutingInDI } from './shared/di/routingTokens';
import { registerJiraApiInDI } from './shared/di/jiraApiTokens';
import { localeProviderToken, JiraLocaleProvider } from './shared/locale';
import { DiagnosticBoardPage } from './features/diagnostic/BoardPage';
import { LocalSettingsBoardPage } from './features/local-settings/BoardPage';
import { extensionApiService } from './shared/ExtensionApiService';
import { AdditionalCardElementsBoardPage } from './features/additional-card-elements/BoardPage';
import { AdditionalCardElementsBoardBacklogPage } from './features/additional-card-elements/BoardBacklogPage';

setAutoFreeze(false);

const domLoaded = () =>
  new Promise(resolve => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') return resolve(undefined);
    window.addEventListener('DOMContentLoaded', resolve);
  });

function initDiContainer() {
  const container = globalContainer;
  registerBoardPagePageObjectInDI(container);
  registerBoardPropertyServiceInDI(container);
  registerJiraServiceInDI(container);
  registerLogger(container);
  registerRoutingInDI(container);
  registerJiraApiInDI(container);
  container.register({
    token: localeProviderToken,
    value: new JiraLocaleProvider(),
  });
}

async function start() {
  if (!isJira) return;

  initBlurSensitive();
  extensionApiService.sendMessage({ message: 'jira-helper-inited' });

  await domLoaded();
  initDiContainer();

  setUpBlurSensitiveOnPage();

  const modificationsMap = {
    [Routes.BOARD]: [
      SwimlaneStats,
      PersonLimits,
      WIPLimitsBoardPage,
      SwimlaneLimits,
      MarkFlaggedIssues,
      FieldLimitsBoardPage,
      WiplimitOnCells,
      CardColorsBoardPage,
      BoardSettingsBoardPage,
      SubTasksProgressBoardPage,
      LocalSettingsBoardPage,
      DiagnosticBoardPage,
      AdditionalCardElementsBoardPage,
    ],
    [Routes.BOARD_BACKLOG]: [AdditionalCardElementsBoardBacklogPage],
    [Routes.SETTINGS]: [
      SwimlaneSettingsPopup,
      WIPLimitsSettingsPage,
      PersonLimitsSettings,
      FieldLimitsSettingsPage,
      WiplimitOnCellsSettings,
      CardColorsSettingsPage,
    ],
    [Routes.ISSUE]: [MarkFlaggedIssues, ToggleForRightSidebar],
    [Routes.SEARCH]: [MarkFlaggedIssues, ToggleForRightSidebar],
    [Routes.REPORTS]: [AddSlaLine, AddChartGrid],
    [Routes.ALL]: [BugTemplate],
  };

  // @ts-expect-error - legacy
  runModifications(modificationsMap);
}

start();

// @ts-expect-error - legacy
window.SettingsPage = SettingsPage;
