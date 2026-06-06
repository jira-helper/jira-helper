import type { SwimlaneSettings } from '../types';

/**
 * Мерджит настройки из двух источников (новый и legacy).
 * Добавляет `columns: []` для старых настроек без этого поля.
 */
export function mergeSwimlaneSettings(
  newSettings: SwimlaneSettings | undefined,
  oldSettings: SwimlaneSettings | undefined
): SwimlaneSettings {
  const result: SwimlaneSettings = {};

  // Сначала обрабатываем старые настройки
  if (oldSettings) {
    for (const [id, setting] of Object.entries(oldSettings)) {
      result[id] = {
        ...setting,
        columns: setting.columns ?? [],
      };
    }
  }

  // Новые настройки перезаписывают старые
  if (newSettings) {
    for (const [id, setting] of Object.entries(newSettings)) {
      result[id] = {
        ...setting,
        columns: setting.columns ?? [],
      };
    }
  }

  return result;
}
