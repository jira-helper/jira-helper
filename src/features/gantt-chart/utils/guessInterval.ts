import type { GanttBar } from '../types';
import type { TimeInterval } from '../types';

const MS_PER_DAY = 86_400_000;

/**
 * Picks the best time-axis interval based on the total date span of the bars.
 *
 * | Span              | Interval |
 * |-------------------|----------|
 * | < 2 days          | hours    |
 * | 2 days – 6 weeks  | days     |
 * | 6 weeks – 6 months| weeks    |
 * | > 6 months        | months   |
 */
export function guessInterval(bars: GanttBar[]): TimeInterval {
  if (bars.length === 0) return 'days';

  let minMs = Infinity;
  let maxMs = -Infinity;

  for (const bar of bars) {
    const s = bar.startDate.getTime();
    const e = bar.endDate.getTime();
    if (s < minMs) minMs = s;
    if (e > maxMs) maxMs = e;
  }

  const spanMs = maxMs - minMs;

  if (spanMs < 2 * MS_PER_DAY) return 'hours';
  if (spanMs < 42 * MS_PER_DAY) return 'days';
  if (spanMs < 180 * MS_PER_DAY) return 'weeks';
  return 'months';
}
