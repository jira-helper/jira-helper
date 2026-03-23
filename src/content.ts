import './firefoxFixes';
import { globalContainer } from 'dioma';
import { setAutoFreeze } from 'immer';
import { Routes } from './routing';
import { isJira } from './shared/utils';
import AddSlaLine from './charts/AddSlaLine';
import AddChartGrid from './charts/AddChartGrid';
import runModifications from './shared/runModifications';
import { BoardPageModification as SwimlaneLimitsBoardPage } from './swimlane-wip-limits/BoardPage';
import { SettingsPageModification as SwimlaneLimitsSettingsPage } from './swimlane-wip-limits/SettingsPage';
import { HistogramModification as SwimlaneHistogramBoardPage } from './swimlane-histogram';
import WIPLimitsSettingsPage from './column-limits/SettingsPage';
import WIPLimitsBoardPage from './column-limits/BoardPage';
import BugTemplate from './bug-template/BugTemplate';
import MarkFlaggedIssues from './issue/MarkFlaggedIssues';
import ToggleForRightSidebar from './issue/ToggleForRightSidebar';
import { SettingsPageModification as FieldLimitsSettingsPage } from './features/field-limits/SettingsPage';
import { BoardPageModification as FieldLimitsBoardPage } from './features/field-limits/BoardPage';
import { blurSensitiveFeatureToken, registerBlurSensitiveFeatureInDI } from './blur-for-sensitive';
import PersonLimitsSettings from './person-limits/SettingsPage';
import PersonLimits from './person-limits/BoardPage';
import WiplimitOnCells from './wiplimit-on-cells/BoardPage';
import WiplimitOnCellsSettings from './wiplimit-on-cells/SettingsPage';
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
import { loadLocalSettings } from './features/local-settings/actions/loadLocalSettings';
import { extensionApiServiceToken, registerExtensionApiServiceInDI } from './shared/ExtensionApiService';
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
  registerExtensionApiServiceInDI(container);
  registerBlurSensitiveFeatureInDI(container);
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

  initDiContainer();

  const blurFeature = globalContainer.inject(blurSensitiveFeatureToken);
  blurFeature.init();
  const extensionApi = globalContainer.inject(extensionApiServiceToken);
  extensionApi.sendMessage({ message: 'jira-helper-inited' });

  await domLoaded();

  // Load local settings (locale, etc.) on all pages
  loadLocalSettings();

  blurFeature.setUpOnPage();

  const modificationsMap = {
    [Routes.BOARD]: [
      // SwimlaneStats, // Legacy - replaced by SwimlaneHistogramBoardPage
      SwimlaneHistogramBoardPage,
      PersonLimits,
      WIPLimitsBoardPage,
      // SwimlaneLimits, // Legacy - replaced by SwimlaneLimitsBoardPage
      SwimlaneLimitsBoardPage,
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
      // SwimlaneSettingsPopup, // Legacy - replaced by SwimlaneLimitsSettingsPage
      SwimlaneLimitsSettingsPage,
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
