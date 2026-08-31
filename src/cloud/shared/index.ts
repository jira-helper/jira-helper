// src/cloud/shared/index.ts
// Экспорт всех общих сервисов

// DI-контейнер (основной способ получения сервисов)
export { cloudContainer, registerCloudServices } from './di';
export {
  settingsServiceToken,
  columnServiceToken,
  assigneeServiceToken,
  avatarIndicatorServiceToken,
  boardPagePageObjectToken,
  assigneeHighlighterApplierToken,
  dynamicUpdaterToken,
} from './di';

// Page Object
export { BoardPagePageObject } from './BoardPagePageObject';
export type { IBoardPagePageObject } from './BoardPagePageObject';

// Классы сервисов (для DI и типизации)
export { ColumnService, type ColumnInfo } from './ColumnService';
export { AssigneeService, type Assignee } from './AssigneeService';
export {
  SettingsService,
  type Settings,
  type AssigneeHighlightSettings,
  type WipLimitSettings,
  type ColumnGroupWipLimitSettings,
} from './SettingsService';
export { AvatarIndicatorService, type AvatarIndicator } from './AvatarIndicatorService';
export { DynamicUpdater } from './DynamicUpdater';
