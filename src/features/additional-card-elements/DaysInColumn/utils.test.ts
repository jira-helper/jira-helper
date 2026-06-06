import { describe, it, expect } from 'vitest';
import {
  getDaysInColumnColor,
  getDaysInColumnColorFromThresholds,
  getEffectiveThresholds,
  formatDaysInColumn,
} from './utils';
import { DaysInColumnSettings } from '../types';

describe('getEffectiveThresholds', () => {
  it('should return global thresholds when usePerColumnThresholds is false', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
      usePerColumnThresholds: false,
    };

    const result = getEffectiveThresholds(settings, 'In Progress');

    expect(result).toEqual({
      warningThreshold: 3,
      dangerThreshold: 7,
    });
  });

  it('should return global thresholds when columnName is not provided', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
      usePerColumnThresholds: true,
      perColumnThresholds: {
        'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
      },
    };

    const result = getEffectiveThresholds(settings);

    expect(result).toEqual({
      warningThreshold: 3,
      dangerThreshold: 7,
    });
  });

  it('should return per-column thresholds when usePerColumnThresholds is true', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
      usePerColumnThresholds: true,
      perColumnThresholds: {
        'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
        Testing: { warningThreshold: 2, dangerThreshold: 4 },
      },
    };

    expect(getEffectiveThresholds(settings, 'In Progress')).toEqual({
      warningThreshold: 5,
      dangerThreshold: 10,
    });

    expect(getEffectiveThresholds(settings, 'Testing')).toEqual({
      warningThreshold: 2,
      dangerThreshold: 4,
    });
  });

  it('should return empty thresholds for column without specific settings', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
      usePerColumnThresholds: true,
      perColumnThresholds: {
        'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
      },
    };

    const result = getEffectiveThresholds(settings, 'Unknown Column');

    expect(result).toEqual({});
  });
});

describe('getDaysInColumnColorFromThresholds', () => {
  it('should return blue when no thresholds are set', () => {
    expect(getDaysInColumnColorFromThresholds(1, {})).toBe('blue');
    expect(getDaysInColumnColorFromThresholds(5, {})).toBe('blue');
    expect(getDaysInColumnColorFromThresholds(100, {})).toBe('blue');
  });

  it('should return yellow when warning threshold is reached', () => {
    const thresholds = { warningThreshold: 3, dangerThreshold: 7 };
    expect(getDaysInColumnColorFromThresholds(3, thresholds)).toBe('yellow');
    expect(getDaysInColumnColorFromThresholds(5, thresholds)).toBe('yellow');
  });

  it('should return red when danger threshold is reached', () => {
    const thresholds = { warningThreshold: 3, dangerThreshold: 7 };
    expect(getDaysInColumnColorFromThresholds(7, thresholds)).toBe('red');
    expect(getDaysInColumnColorFromThresholds(10, thresholds)).toBe('red');
  });
});

describe('getDaysInColumnColor', () => {
  it('should return blue when no thresholds are set', () => {
    const settings: DaysInColumnSettings = { enabled: true };
    expect(getDaysInColumnColor(1, settings)).toBe('blue');
    expect(getDaysInColumnColor(5, settings)).toBe('blue');
    expect(getDaysInColumnColor(100, settings)).toBe('blue');
  });

  it('should return blue when days are below warning threshold', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
    };
    expect(getDaysInColumnColor(1, settings)).toBe('blue');
    expect(getDaysInColumnColor(2, settings)).toBe('blue');
  });

  it('should return yellow when days are at or above warning threshold but below danger', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
    };
    expect(getDaysInColumnColor(3, settings)).toBe('yellow');
    expect(getDaysInColumnColor(5, settings)).toBe('yellow');
    expect(getDaysInColumnColor(6, settings)).toBe('yellow');
  });

  it('should return red when days are at or above danger threshold', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
    };
    expect(getDaysInColumnColor(7, settings)).toBe('red');
    expect(getDaysInColumnColor(10, settings)).toBe('red');
    expect(getDaysInColumnColor(100, settings)).toBe('red');
  });

  it('should return yellow when only warning threshold is set', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
    };
    expect(getDaysInColumnColor(2, settings)).toBe('blue');
    expect(getDaysInColumnColor(3, settings)).toBe('yellow');
    expect(getDaysInColumnColor(100, settings)).toBe('yellow');
  });

  it('should return red when only danger threshold is set', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      dangerThreshold: 5,
    };
    expect(getDaysInColumnColor(4, settings)).toBe('blue');
    expect(getDaysInColumnColor(5, settings)).toBe('red');
    expect(getDaysInColumnColor(100, settings)).toBe('red');
  });

  it('should handle edge case when danger <= warning (invalid config)', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 5,
      dangerThreshold: 3, // Invalid: danger < warning
    };
    // Danger takes priority, so 3+ days will be red
    expect(getDaysInColumnColor(2, settings)).toBe('blue');
    expect(getDaysInColumnColor(3, settings)).toBe('red');
    expect(getDaysInColumnColor(5, settings)).toBe('red');
  });

  it('should use per-column thresholds when enabled', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
      usePerColumnThresholds: true,
      perColumnThresholds: {
        'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
        Testing: { warningThreshold: 2, dangerThreshold: 4 },
      },
    };

    // In Progress column: warning at 5, danger at 10
    expect(getDaysInColumnColor(4, settings, 'In Progress')).toBe('blue');
    expect(getDaysInColumnColor(5, settings, 'In Progress')).toBe('yellow');
    expect(getDaysInColumnColor(10, settings, 'In Progress')).toBe('red');

    // Testing column: warning at 2, danger at 4
    expect(getDaysInColumnColor(1, settings, 'Testing')).toBe('blue');
    expect(getDaysInColumnColor(2, settings, 'Testing')).toBe('yellow');
    expect(getDaysInColumnColor(4, settings, 'Testing')).toBe('red');
  });

  it('should return blue for columns without specific thresholds when per-column is enabled', () => {
    const settings: DaysInColumnSettings = {
      enabled: true,
      warningThreshold: 3,
      dangerThreshold: 7,
      usePerColumnThresholds: true,
      perColumnThresholds: {
        'In Progress': { warningThreshold: 5, dangerThreshold: 10 },
      },
    };

    // Unknown column has no thresholds defined
    expect(getDaysInColumnColor(1, settings, 'Unknown Column')).toBe('blue');
    expect(getDaysInColumnColor(10, settings, 'Unknown Column')).toBe('blue');
    expect(getDaysInColumnColor(100, settings, 'Unknown Column')).toBe('blue');
  });
});

describe('formatDaysInColumn', () => {
  it('should format zero days as "<1 day in column" in English', () => {
    expect(formatDaysInColumn(0, 'en')).toBe('<1 day in column');
  });

  it('should format zero days as "<1 дн. в колонке" in Russian', () => {
    expect(formatDaysInColumn(0, 'ru')).toBe('<1 дн. в колонке');
  });

  it('should format correctly in English', () => {
    expect(formatDaysInColumn(1, 'en')).toBe('1 day in column');
    expect(formatDaysInColumn(2, 'en')).toBe('2 days in column');
    expect(formatDaysInColumn(5, 'en')).toBe('5 days in column');
  });

  it('should format correctly in Russian', () => {
    expect(formatDaysInColumn(1, 'ru')).toBe('1 дн. в колонке');
    expect(formatDaysInColumn(2, 'ru')).toBe('2 дн. в колонке');
    expect(formatDaysInColumn(5, 'ru')).toBe('5 дн. в колонке');
  });

  it('should default to English', () => {
    expect(formatDaysInColumn(3)).toBe('3 days in column');
  });
});
