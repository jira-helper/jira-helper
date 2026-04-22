import { scaleTime, type ScaleTime } from 'd3-scale';
import { utcDay, utcHour, utcMonth, utcWeek } from 'd3-time';
import type { GanttBar, TimeInterval } from '../types';

const LEFT_PADDING_RATIO = 0.05;
const RIGHT_PADDING_RATIO = 0.1;
const MIN_RIGHT_PADDING_MS = 3 * 86_400_000;

/** One day in ms; used for empty bars and zero-span fallback. */
const DAY_MS = 86_400_000;

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function paddedDomainFromMinMax(minMs: number, maxMs: number): [Date, Date] {
  let span = maxMs - minMs;
  if (span <= 0) {
    span = DAY_MS;
  }
  const leftPad = span * LEFT_PADDING_RATIO;
  const rightPad = Math.max(span * RIGHT_PADDING_RATIO, MIN_RIGHT_PADDING_MS);
  return [new Date(minMs - leftPad), new Date(maxMs + rightPad)];
}

function domainFromBars(bars: GanttBar[]): [Date, Date] {
  if (bars.length === 0) {
    const now = Date.now();
    return [new Date(now - DAY_MS), new Date(now + DAY_MS)];
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const b of bars) {
    const s = b.startDate.getTime();
    const e = b.endDate.getTime();
    min = Math.min(min, s, e);
    max = Math.max(max, s, e);
  }
  return paddedDomainFromMinMax(min, max);
}

function utcInterval(interval: TimeInterval) {
  switch (interval) {
    case 'hours':
      return utcHour;
    case 'days':
      return utcDay;
    case 'weeks':
      return utcWeek;
    case 'months':
      return utcMonth;
    default: {
      const _exhaustive: never = interval;
      return _exhaustive;
    }
  }
}

/** Calendar week number in UTC (approximation aligned with week ticks, not full ISO-8601). */
function utcWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
}

function tickFormatForInterval(interval: TimeInterval): (d: Date) => string {
  switch (interval) {
    case 'hours':
      return d => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    case 'days':
      return d => `${MONTH_SHORT[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`;
    case 'weeks':
      return d => `Week ${String(utcWeekNumber(d)).padStart(2, '0')}`;
    case 'months':
      return d => `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    default: {
      const _exhaustive: never = interval;
      return _exhaustive;
    }
  }
}

export type ComputeTimeScaleResult = {
  scale: ScaleTime<number, number>;
  ticks: Date[];
  tickFormat: (d: Date) => string;
};

/**
 * Builds a d3 time scale and tick configuration for the Gantt time axis from bar date ranges.
 *
 * @param bars - Drawable bars; empty array uses a ±1 day window around `Date.now()`.
 * @param chartWidth - Pixel width mapped to the domain.
 * @param interval - Tick step: hours, days, weeks, or months (UTC boundaries).
 */
export function computeTimeScale(bars: GanttBar[], chartWidth: number, interval: TimeInterval): ComputeTimeScaleResult {
  const [d0, d1] = domainFromBars(bars);
  const scale = scaleTime().domain([d0, d1]).range([0, chartWidth]);
  const step = utcInterval(interval);
  const ticks = scale.ticks(step);
  const tickFormat = tickFormatForInterval(interval);
  return { scale, ticks, tickFormat };
}
