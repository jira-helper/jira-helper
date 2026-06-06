import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDaysRemaining, getDaysToDeadlineColor, formatDaysToDeadline } from './utils';
import { DaysToDeadlineSettings } from '../types';

describe('calculateDaysRemaining', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-15
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null for null or undefined input', () => {
    expect(calculateDaysRemaining(null)).toBe(null);
    expect(calculateDaysRemaining(undefined)).toBe(null);
    expect(calculateDaysRemaining('')).toBe(null);
  });

  it('should return null for invalid date string', () => {
    expect(calculateDaysRemaining('not a date')).toBe(null);
    expect(calculateDaysRemaining('invalid')).toBe(null);
  });

  it('should calculate positive days remaining', () => {
    expect(calculateDaysRemaining('2024-01-20')).toBe(5);
    expect(calculateDaysRemaining('2024-01-16')).toBe(1);
    expect(calculateDaysRemaining('2024-02-15')).toBe(31);
  });

  it('should return 0 for today', () => {
    expect(calculateDaysRemaining('2024-01-15')).toBe(0);
  });

  it('should calculate negative days for overdue', () => {
    expect(calculateDaysRemaining('2024-01-14')).toBe(-1);
    expect(calculateDaysRemaining('2024-01-10')).toBe(-5);
  });

  it('should handle ISO date strings', () => {
    expect(calculateDaysRemaining('2024-01-20T10:30:00.000Z')).toBe(5);
  });
});

describe('getDaysToDeadlineColor', () => {
  const settings: DaysToDeadlineSettings = { enabled: true };

  it('should return null for null days', () => {
    expect(getDaysToDeadlineColor(null, settings)).toBe(null);
  });

  it('should return red for overdue (negative days)', () => {
    expect(getDaysToDeadlineColor(-1, settings)).toBe('red');
    expect(getDaysToDeadlineColor(-5, settings)).toBe('red');
    expect(getDaysToDeadlineColor(-100, settings)).toBe('red');
  });

  it('should return yellow for today (0 days) - always urgent', () => {
    expect(getDaysToDeadlineColor(0, settings)).toBe('yellow');
  });

  it('should return yellow for tomorrow (1 day) - always urgent', () => {
    expect(getDaysToDeadlineColor(1, settings)).toBe('yellow');
  });

  it('should return blue when no warning threshold is set and more than 1 day left', () => {
    expect(getDaysToDeadlineColor(2, settings)).toBe('blue');
    expect(getDaysToDeadlineColor(10, settings)).toBe('blue');
  });

  it('should return yellow when within warning threshold', () => {
    const settingsWithWarning: DaysToDeadlineSettings = {
      enabled: true,
      warningThreshold: 5,
    };
    expect(getDaysToDeadlineColor(3, settingsWithWarning)).toBe('yellow');
    expect(getDaysToDeadlineColor(5, settingsWithWarning)).toBe('yellow');
  });

  it('should return blue when above warning threshold', () => {
    const settingsWithWarning: DaysToDeadlineSettings = {
      enabled: true,
      warningThreshold: 3,
    };
    expect(getDaysToDeadlineColor(4, settingsWithWarning)).toBe('blue');
    expect(getDaysToDeadlineColor(10, settingsWithWarning)).toBe('blue');
  });

  it('should prioritize red for overdue even with warning threshold', () => {
    const settingsWithWarning: DaysToDeadlineSettings = {
      enabled: true,
      warningThreshold: 3,
    };
    expect(getDaysToDeadlineColor(-1, settingsWithWarning)).toBe('red');
  });
});

describe('formatDaysToDeadline', () => {
  describe('English', () => {
    it('should format overdue correctly with emoji', () => {
      expect(formatDaysToDeadline(-1, 'en')).toBe('⏰ 1 day overdue');
      expect(formatDaysToDeadline(-2, 'en')).toBe('⏰ 2 days overdue');
      expect(formatDaysToDeadline(-10, 'en')).toBe('⏰ 10 days overdue');
    });

    it('should format today correctly with emoji', () => {
      expect(formatDaysToDeadline(0, 'en')).toBe('⏰ Due today!');
    });

    it('should format tomorrow correctly with emoji', () => {
      expect(formatDaysToDeadline(1, 'en')).toBe('⏰ Due tomorrow');
    });

    it('should format future days correctly with emoji', () => {
      expect(formatDaysToDeadline(2, 'en')).toBe('⏰ 2 days left');
      expect(formatDaysToDeadline(10, 'en')).toBe('⏰ 10 days left');
    });
  });

  describe('Russian', () => {
    it('should format overdue correctly with emoji', () => {
      expect(formatDaysToDeadline(-1, 'ru')).toBe('⏰ Просрочено на 1 дн.');
      expect(formatDaysToDeadline(-5, 'ru')).toBe('⏰ Просрочено на 5 дн.');
    });

    it('should format today correctly with emoji', () => {
      expect(formatDaysToDeadline(0, 'ru')).toBe('⏰ Сегодня!');
    });

    it('should format tomorrow correctly with emoji', () => {
      expect(formatDaysToDeadline(1, 'ru')).toBe('⏰ Завтра');
    });

    it('should format future days correctly with emoji', () => {
      expect(formatDaysToDeadline(5, 'ru')).toBe('⏰ 5 дн.');
    });
  });

  it('should default to English', () => {
    expect(formatDaysToDeadline(5)).toBe('⏰ 5 days left');
  });
});
