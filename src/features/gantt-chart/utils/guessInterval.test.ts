import { describe, it, expect } from 'vitest';
import type { GanttBar } from '../types';
import { guessInterval } from './guessInterval';

function bar(start: string, end: string): GanttBar {
  return {
    issueKey: 'X-1',
    issueId: '1',
    label: 'X-1',
    startDate: new Date(start),
    endDate: new Date(end),
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
  };
}

describe('guessInterval', () => {
  it('returns "days" for empty bars', () => {
    expect(guessInterval([])).toBe('days');
  });

  it('returns "hours" for span < 2 days', () => {
    expect(guessInterval([bar('2026-04-10T08:00:00Z', '2026-04-11T12:00:00Z')])).toBe('hours');
  });

  it('returns "days" for span of 2 weeks', () => {
    expect(guessInterval([bar('2026-04-01', '2026-04-14')])).toBe('days');
  });

  it('returns "weeks" for span of ~2 months', () => {
    expect(guessInterval([bar('2026-01-01', '2026-03-01')])).toBe('weeks');
  });

  it('returns "months" for span > 6 months', () => {
    expect(guessInterval([bar('2025-01-01', '2025-12-31')])).toBe('months');
  });

  it('uses overall min/max across multiple bars', () => {
    expect(guessInterval([bar('2025-01-01', '2025-02-01'), bar('2025-06-01', '2025-12-31')])).toBe('months');
  });
});
