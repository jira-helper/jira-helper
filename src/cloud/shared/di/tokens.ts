// src/cloud/shared/di/tokens.ts
// Токены для DI-контейнера Cloud

import { Token } from 'dioma';

// Re-export the shared boardPagePageObjectToken from infrastructure
export { boardPagePageObjectToken } from '../../../infrastructure/page-objects/BoardPage';

// Services
export const settingsServiceToken = new Token<import('../SettingsService').SettingsService>('SettingsService');
export const columnServiceToken = new Token<import('../ColumnService').ColumnService>('ColumnService');
export const assigneeServiceToken = new Token<import('../AssigneeService').AssigneeService>('AssigneeService');
export const avatarIndicatorServiceToken = new Token<import('../AvatarIndicatorService').AvatarIndicatorService>(
  'AvatarIndicatorService'
);
export const settingsStorageToken = new Token<import('../SettingsStorage').SettingsStorage>('SettingsStorage');

// Appliers
export const assigneeHighlighterApplierToken = new Token<
  import('../../features/assignee-highlighter/AssigneeHighlighterApplier').AssigneeHighlighterApplier
>('AssigneeHighlighterApplier');
export const dynamicUpdaterToken = new Token<import('../DynamicUpdater').DynamicUpdater>('DynamicUpdater');