import { BadgeColor } from '../Badge';
import { ColumnThresholds, DaysInColumnSettings } from '../types';

/**
 * Gets effective thresholds for a column.
 * If usePerColumnThresholds is enabled, returns per-column thresholds.
 * Otherwise, returns global thresholds.
 */
export function getEffectiveThresholds(settings: DaysInColumnSettings, columnName?: string): ColumnThresholds {
  if (settings.usePerColumnThresholds && columnName) {
    return settings.perColumnThresholds?.[columnName] || {};
  }

  return {
    warningThreshold: settings.warningThreshold,
    dangerThreshold: settings.dangerThreshold,
  };
}

/**
 * Determines the badge color based on days in column and thresholds
 */
export function getDaysInColumnColorFromThresholds(days: number, thresholds: ColumnThresholds): BadgeColor {
  const { warningThreshold, dangerThreshold } = thresholds;

  // If danger is set and reached - red
  if (dangerThreshold !== undefined && days >= dangerThreshold) {
    return 'red';
  }

  // If warning is set and reached - yellow
  if (warningThreshold !== undefined && days >= warningThreshold) {
    return 'yellow';
  }

  // Default - blue
  return 'blue';
}

/**
 * Determines the badge color based on days in column and settings.
 * Supports both global and per-column thresholds.
 */
export function getDaysInColumnColor(days: number, settings: DaysInColumnSettings, columnName?: string): BadgeColor {
  const thresholds = getEffectiveThresholds(settings, columnName);
  return getDaysInColumnColorFromThresholds(days, thresholds);
}

/**
 * Formats days in column for display
 */
export function formatDaysInColumn(days: number, locale: 'ru' | 'en' = 'en'): string {
  if (locale === 'ru') {
    if (days === 0) {
      return '<1 дн. в колонке';
    }
    return `${days} дн. в колонке`;
  }

  // English
  if (days === 0) {
    return '<1 day in column';
  }
  return `${days} day${days === 1 ? '' : 's'} in column`;
}
