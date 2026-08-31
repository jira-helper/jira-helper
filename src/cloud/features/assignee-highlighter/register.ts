// src/cloud/features/assignee-highlighter/register.ts
// Регистрация сервисов Assignee Highlighter в DI-контейнере

import { Container } from 'dioma';
import { settingsServiceToken } from '../../shared/di/tokens';
import { assigneeHighlighterFeatureSettingsToken } from './tokens';
import { AssigneeHighlighterFeatureSettings } from './AssigneeHighlighterFeatureSettings';

/**
 * Регистрирует сервисы Assignee Highlighter в переданном контейнере
 */
export function registerInContainer(container: Container): void {
  // AssigneeHighlighterFeatureSettings - используем value вместо factory
  container.register({
    token: assigneeHighlighterFeatureSettingsToken,
    value: new AssigneeHighlighterFeatureSettings(container.inject(settingsServiceToken)),
  });
}
