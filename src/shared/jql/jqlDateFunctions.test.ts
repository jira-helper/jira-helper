import { describe, expect, it } from 'vitest';
import { compareOrdered, evaluateJqlDateFunction, parseComparable } from './jqlDateFunctions';

describe('jqlDateFunctions', () => {
  const now = new Date(2026, 7, 10, 15, 30, 0, 0); // local 2026-08-10 15:30 (Monday)

  it('parseComparable handles numbers, date-only, and datetime', () => {
    expect(parseComparable('13')).toBe(13);
    expect(parseComparable(13)).toBe(13);
    expect(parseComparable('2026-08-10')).toBe(new Date(2026, 7, 10).getTime());
    expect(parseComparable('2026-08-10T15:30:00.000Z')).toBe(Date.parse('2026-08-10T15:30:00.000Z'));
    expect(parseComparable(null)).toBeNull();
    expect(parseComparable('')).toBeNull();
    expect(parseComparable('not-a-date')).toBeNull();
  });

  it('compareOrdered compares numbers and dates', () => {
    expect(compareOrdered('14', '>', '13')).toBe(true);
    expect(compareOrdered('2026-08-09', '<', '2026-08-10')).toBe(true);
    expect(compareOrdered(undefined, '<', '2026-08-10')).toBe(false);
  });

  it('evaluates now and day/week/month/year boundaries', () => {
    expect(evaluateJqlDateFunction('now', [], now)).toBe(now.getTime());
    expect(evaluateJqlDateFunction('startOfDay', [], now)).toBe(new Date(2026, 7, 10).getTime());
    expect(evaluateJqlDateFunction('endOfDay', [], now)).toBe(new Date(2026, 7, 10, 23, 59, 59, 999).getTime());
    expect(evaluateJqlDateFunction('startOfDay', ['-1d'], now)).toBe(new Date(2026, 7, 9).getTime());
    expect(evaluateJqlDateFunction('startOfWeek', [], now)).toBe(new Date(2026, 7, 10).getTime());
    expect(evaluateJqlDateFunction('endOfWeek', [], now)).toBe(new Date(2026, 7, 16, 23, 59, 59, 999).getTime());
    expect(evaluateJqlDateFunction('startOfMonth', [], now)).toBe(new Date(2026, 7, 1).getTime());
    expect(evaluateJqlDateFunction('endOfMonth', [], now)).toBe(new Date(2026, 7, 31, 23, 59, 59, 999).getTime());
    expect(evaluateJqlDateFunction('startOfYear', [], now)).toBe(new Date(2026, 0, 1).getTime());
    expect(evaluateJqlDateFunction('endOfYear', [], now)).toBe(new Date(2026, 11, 31, 23, 59, 59, 999).getTime());
  });

  it('rejects unknown functions and bad increments', () => {
    expect(() => evaluateJqlDateFunction('currentUser', [], now)).toThrow(/Unsupported function/i);
    expect(() => evaluateJqlDateFunction('startOfDay', ['yesterday'], now)).toThrow(/Invalid date increment/i);
  });
});
