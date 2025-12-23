import { describe, it, expect } from 'vitest';
import { getDaysInColumnColor, formatDaysInColumn } from './utils';
import { DaysInColumnSettings } from '../types';

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
