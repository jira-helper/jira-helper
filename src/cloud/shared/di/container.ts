// src/cloud/shared/di/container.ts
// DI-контейнер для cloud-версии расширения

import { Container } from 'dioma';
import {
  settingsServiceToken,
  columnServiceToken,
  assigneeServiceToken,
  avatarIndicatorServiceToken,
  assigneeHighlighterApplierToken,
  dynamicUpdaterToken,
} from './tokens';
import { registerJiraApiCloudInDI } from './jiraApiTokens.cloud';
import { boardPagePageObjectToken } from '../../../infrastructure/page-objects/BoardPage';

import { SettingsService } from '../SettingsService';
import { ColumnService } from '../ColumnService';
import { AssigneeService } from '../AssigneeService';
import { AvatarIndicatorService } from '../AvatarIndicatorService';
import { BoardPagePageObject as CloudBoardPagePageObject } from '../BoardPagePageObject';
import { AssigneeHighlighterApplier } from '../../features/assignee-highlighter/AssigneeHighlighterApplier';
import { DynamicUpdater } from '../DynamicUpdater';

import { registerInContainer as registerAssigneeHighlighter } from '../../features/assignee-highlighter/register';

export const cloudContainer = new Container();

export function registerCloudServices(): void {
  cloudContainer.register({
    token: boardPagePageObjectToken,
    value: CloudBoardPagePageObject,
  });

  cloudContainer.register({
    token: settingsServiceToken,
    value: new SettingsService(cloudContainer.inject(boardPagePageObjectToken)),
  });

  cloudContainer.register({
    token: columnServiceToken,
    value: new ColumnService(cloudContainer.inject(boardPagePageObjectToken)),
  });

  cloudContainer.register({
    token: assigneeServiceToken,
    value: new AssigneeService(cloudContainer.inject(settingsServiceToken)),
  });

  cloudContainer.register({
    token: avatarIndicatorServiceToken,
    value: new AvatarIndicatorService(cloudContainer.inject(assigneeServiceToken)),
  });

  cloudContainer.register({
    token: dynamicUpdaterToken,
    value: new DynamicUpdater(),
  });

  cloudContainer.register({
    token: assigneeHighlighterApplierToken,
    value: (() => {
      const settingsService = cloudContainer.inject(settingsServiceToken);
      const updater = cloudContainer.inject(dynamicUpdaterToken);
      const applier = new AssigneeHighlighterApplier(settingsService, cloudContainer.inject(assigneeServiceToken));
      // Подписка на DynamicUpdater
      updater.onUpdate(() => applier.updateVisualization());
      // Подписка на изменение настроек
      settingsService.onSettingsChanged(() => {
        console.log('[SettingsService] Изменение настроек - обновляем AssigneeHighlighterApplier');
        applier.updateVisualization();
      });
      return applier;
    })(),
  });

  registerAssigneeHighlighter(cloudContainer);

  // Регистрируем Cloud API адаптеры
  registerJiraApiCloudInDI(cloudContainer);

  console.log('[DI] Cloud services registered');
}

export function resolveService<T>(token: any): T {
  return cloudContainer.inject(token);
}
