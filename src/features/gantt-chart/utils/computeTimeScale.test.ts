import { describe, it, expect, vi, afterEach } from 'vitest';
import type { GanttBar } from '../types';
import { computeTimeScale } from './computeTimeScale';

const DAY_MS = 86_400_000;
const LEFT_PAD_RATIO = 0.05;
const RIGHT_PAD_RATIO = 0.1;
const MIN_RIGHT_PAD_MS = 3 * DAY_MS;

function bar(overrides: Partial<GanttBar> & Pick<GanttBar, 'startDate' | 'endDate'>): GanttBar {
  return {
    issueKey: 'K-1',
    issueId: '1',
    label: 'K-1',
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

describe('computeTimeScale', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps domain endpoints to range for a single bar with asymmetric padding', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = new Date('2024-06-11T00:00:00.000Z');
    const chartWidth = 1000;
    const { scale } = computeTimeScale([bar({ startDate: start, endDate: end })], chartWidth, 'days');

    const span = end.getTime() - start.getTime();
    const leftPad = span * LEFT_PAD_RATIO;
    const rightPad = Math.max(span * RIGHT_PAD_RATIO, MIN_RIGHT_PAD_MS);
    const d0 = start.getTime() - leftPad;
    const d1 = end.getTime() + rightPad;

    expect(scale.domain()[0].getTime()).toBe(d0);
    expect(scale.domain()[1].getTime()).toBe(d1);
    expect(scale.range()).toEqual([0, chartWidth]);
    expect(scale(new Date(d0))).toBe(0);
    expect(scale(new Date(d1))).toBe(chartWidth);
  });

  it('uses a default two-day window around now when bars are empty', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));

    const chartWidth = 500;
    const { scale } = computeTimeScale([], chartWidth, 'days');

    const now = Date.now();
    expect(scale.domain()[0].getTime()).toBe(now - DAY_MS);
    expect(scale.domain()[1].getTime()).toBe(now + DAY_MS);
    expect(scale.range()).toEqual([0, chartWidth]);
  });

  it('expands zero-length span to one day before applying padding (one bar, same start/end)', () => {
    const t = new Date('2024-03-10T08:00:00.000Z');
    const chartWidth = 200;
    const { scale } = computeTimeScale([bar({ startDate: t, endDate: t })], chartWidth, 'hours');

    const leftPad = DAY_MS * LEFT_PAD_RATIO;
    const rightPad = Math.max(DAY_MS * RIGHT_PAD_RATIO, MIN_RIGHT_PAD_MS);
    const d0 = t.getTime() - leftPad;
    const d1 = t.getTime() + rightPad;
    expect(scale.domain()[0].getTime()).toBe(d0);
    expect(scale.domain()[1].getTime()).toBe(d1);
  });

  it('produces hour-granularity ticks and formats as HH:mm (UTC)', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = new Date('2024-06-01T06:00:00.000Z');
    const { ticks, tickFormat } = computeTimeScale([bar({ startDate: start, endDate: end })], 800, 'hours');

    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every(d => d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0)).toBe(true);
    expect(tickFormat(new Date('2024-06-01T14:30:00.000Z'))).toBe('14:30');
  });

  it('produces day-granularity ticks and formats as MMM dd (UTC)', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = new Date('2024-06-10T00:00:00.000Z');
    const { ticks, tickFormat } = computeTimeScale([bar({ startDate: start, endDate: end })], 800, 'days');

    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every(d => d.getUTCHours() === 0 && d.getUTCMinutes() === 0)).toBe(true);
    expect(tickFormat(new Date('2024-07-04T15:00:00.000Z'))).toBe('Jul 04');
  });

  it('produces week-granularity ticks and formats as Week WW', () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const end = new Date('2024-03-01T00:00:00.000Z');
    const { ticks, tickFormat } = computeTimeScale([bar({ startDate: start, endDate: end })], 800, 'weeks');

    expect(ticks.length).toBeGreaterThan(0);
    expect(tickFormat(new Date('2024-01-10T12:00:00.000Z'))).toMatch(/^Week \d{2}$/);
    expect(ticks.every(d => tickFormat(d).startsWith('Week '))).toBe(true);
  });

  it('produces month-granularity ticks and formats as MMM yyyy (UTC)', () => {
    const start = new Date('2024-01-15T00:00:00.000Z');
    const end = new Date('2024-06-15T00:00:00.000Z');
    const { ticks, tickFormat } = computeTimeScale([bar({ startDate: start, endDate: end })], 800, 'months');

    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every(d => d.getUTCDate() === 1 && d.getUTCHours() === 0)).toBe(true);
    expect(tickFormat(new Date('2024-09-01T00:00:00.000Z'))).toBe('Sep 2024');
  });

  it('aggregates min/max across multiple bars', () => {
    const b1 = bar({
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2024-01-05T00:00:00.000Z'),
    });
    const b2 = bar({
      issueKey: 'K-2',
      startDate: new Date('2024-02-01T00:00:00.000Z'),
      endDate: new Date('2024-02-10T00:00:00.000Z'),
    });
    const { scale } = computeTimeScale([b1, b2], 400, 'days');

    const min = new Date('2024-01-01T00:00:00.000Z').getTime();
    const max = new Date('2024-02-10T00:00:00.000Z').getTime();
    const span = max - min;
    const leftPad = span * LEFT_PAD_RATIO;
    const rightPad = Math.max(span * RIGHT_PAD_RATIO, MIN_RIGHT_PAD_MS);
    expect(scale.domain()[0].getTime()).toBe(min - leftPad);
    expect(scale.domain()[1].getTime()).toBe(max + rightPad);
  });
});
