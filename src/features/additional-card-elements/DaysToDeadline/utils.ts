import { BadgeColor } from '../Badge';
import { DaysToDeadlineSettings } from '../types';

/**
 * Calculates days remaining until deadline
 * Returns null if date is invalid or empty
 */
export function calculateDaysRemaining(deadlineDate: string | null | undefined): number | null {
  if (!deadlineDate) {
    return null;
  }

  const deadline = new Date(deadlineDate);
  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  // Set deadline to end of day
  deadline.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines the badge color based on days remaining and settings
 */
export function getDaysToDeadlineColor(days: number | null, settings: DaysToDeadlineSettings): BadgeColor | null {
  if (days === null) {
    return null; // Don't display
  }

  // Overdue - always red
  if (days < 0) {
    return 'red';
  }

  // Today or tomorrow - always yellow (urgent)
  if (days <= 1) {
    return 'yellow';
  }

  // If warning is set and days remaining are within threshold - yellow
  if (settings.warningThreshold !== undefined && days <= settings.warningThreshold) {
    return 'yellow';
  }

  // Default - blue
  return 'blue';
}

const DEADLINE_EMOJI = '⏰';

/**
 * Formats days to deadline for display
 */
export function formatDaysToDeadline(days: number, locale: 'ru' | 'en' = 'en'): string {
  if (locale === 'ru') {
    if (days < 0) {
      return `${DEADLINE_EMOJI} Просрочено на ${Math.abs(days)} дн.`;
    }
    if (days === 0) {
      return `${DEADLINE_EMOJI} Сегодня!`;
    }
    if (days === 1) {
      return `${DEADLINE_EMOJI} Завтра`;
    }
    return `${DEADLINE_EMOJI} ${days} дн.`;
  }

  // English
  if (days < 0) {
    return `${DEADLINE_EMOJI} ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  }
  if (days === 0) {
    return `${DEADLINE_EMOJI} Due today!`;
  }
  if (days === 1) {
    return `${DEADLINE_EMOJI} Due tomorrow`;
  }
  return `${DEADLINE_EMOJI} ${days} days left`;
}
