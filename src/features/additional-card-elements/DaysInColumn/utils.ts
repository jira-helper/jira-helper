import { BadgeColor } from '../Badge';
import { DaysInColumnSettings } from '../types';

/**
 * Determines the badge color based on days in column and settings
 */
export function getDaysInColumnColor(days: number, settings: DaysInColumnSettings): BadgeColor {
  const { warningThreshold, dangerThreshold } = settings;

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
