// src/cloud/content.cloud.ts
// Cloud entry point for Jira Cloud (atlassian.net)

import 'antd/dist/reset.css';

import { globalContainer } from 'dioma';
import { Routes, registerRoutingServiceInDI, routingServiceToken } from '../infrastructure/routing';
import { registerExtensionApiServiceInDI } from '../infrastructure/extension-api/ExtensionApiService';
import { registerLogger } from '../infrastructure/logging/Logger';
import { localeProviderToken, JiraLocaleProvider } from '../shared/locale';
import {
  cloudContainer,
  registerCloudServices,
  settingsServiceToken,
  assigneeHighlighterApplierToken,
  dynamicUpdaterToken,
} from './shared/di';
import { BoardSettingsBoardPage } from '../features/board-settings/BoardPage';
import { LocalSettingsBoardPage } from '../features/local-settings/BoardPage';
import { boardPagePageObjectToken } from '../infrastructure/page-objects/BoardPage';
import runModifications from '../infrastructure/page-modification/runModifications';
import { loadLocalSettings } from '../features/local-settings/actions/loadLocalSettings';
import { diagnosticModule } from '../features/diagnostic-module/module';
import { columnLimitsModule } from '../features/column-limits-module/module';
import ColumnLimitsBoardPage from '../features/column-limits-module/BoardPage';
import { personLimitsModule } from '../features/person-limits-module/module';
import PersonLimitsBoardPage from '../features/person-limits-module/BoardPage';
import { registerBoardPropertyServiceInDI } from '../infrastructure/jira/boardPropertyService';
import { registerJiraApiInDI } from '../infrastructure/di/jiraApiTokens';
import { registerServerApiCloudAdapters } from './shared/di/serverApiAdapters.cloud';
import { jiraEnvironmentToken } from '../infrastructure/di/jiraEnvironmentToken';
import { startCloudExtension } from './startCloudExtension';

function initCloudDiContainer() {
  registerLogger(globalContainer);
  registerExtensionApiServiceInDI(globalContainer);
  registerRoutingServiceInDI(globalContainer);
  globalContainer.register({
    token: localeProviderToken,
    value: new JiraLocaleProvider(),
  });
  globalContainer.register({
    token: jiraEnvironmentToken,
    value: { type: 'cloud' },
  });
}

// Инициализация всех модулей (async)
export async function initializeCloudExtension(): Promise<void> {
  initCloudDiContainer();
  registerCloudServices();

  const routingService = globalContainer.inject(routingServiceToken);

  const assigneeHighlighterApplier = cloudContainer.inject(assigneeHighlighterApplierToken);
  const dynamicUpdater = cloudContainer.inject(dynamicUpdaterToken);

  await cloudContainer.inject(settingsServiceToken).waitForInit();

  assigneeHighlighterApplier.updateVisualization();

  dynamicUpdater.start();

  const settingsService = cloudContainer.inject(settingsServiceToken);
  const settings = settingsService.getSettings();

  if (settings.assigneeHighlight?.enabled) {
    assigneeHighlighterApplier.enable();
  }

  const boardPageObject = cloudContainer.inject(boardPagePageObjectToken);

  // Register Cloud BoardPagePageObject in globalContainer so PageModifications can use it
  globalContainer.register({ token: boardPagePageObjectToken, value: boardPageObject });

  registerJiraApiInDI(globalContainer);
  registerServerApiCloudAdapters(globalContainer);
  registerBoardPropertyServiceInDI(globalContainer);
  diagnosticModule.ensure(globalContainer);
  columnLimitsModule.ensure(globalContainer);
  personLimitsModule.ensure(globalContainer);

  const columnLimitsBoardPage = new ColumnLimitsBoardPage(globalContainer);
  const personLimitsBoardPage = new PersonLimitsBoardPage(globalContainer);

  const boardSettingsBoardPage = new BoardSettingsBoardPage(globalContainer);
  const localSettingsBoardPage = new LocalSettingsBoardPage(globalContainer);

  const modificationsMap = {
    [Routes.BOARD]: [boardSettingsBoardPage, localSettingsBoardPage, columnLimitsBoardPage, personLimitsBoardPage],
    [Routes.ALL]: [],
  };

  runModifications(modificationsMap, routingService);

  loadLocalSettings();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  startCloudExtension(initializeCloudExtension);
}

export { cloudContainer };

export { settingsServiceToken, assigneeHighlighterApplierToken, dynamicUpdaterToken } from './shared/di';

export type { Settings, AssigneeHighlightSettings, WipLimitSettings, ColumnGroupWipLimitSettings } from './shared';
