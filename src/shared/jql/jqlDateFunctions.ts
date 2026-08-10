/**
 * Client-side evaluation of Jira JQL date functions and ordered comparisons.
 *
 * Date-only values (`YYYY-MM-DD`) and period boundaries use the local timezone
 * of the provided `now` clock (browser-local in production).
 * Week starts on Monday (ISO-8601).
 */

export type JqlDateUnit = 'y' | 'M' | 'w' | 'd' | 'h' | 'm';

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const INCREMENT_RE = /^([+-]?)(\d+)([yMwdhm])?$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;

export const SUPPORTED_JQL_DATE_FUNCTIONS = [
  'now',
  'startofday',
  'startofweek',
  'startofmonth',
  'startofyear',
  'endofday',
  'endofweek',
  'endofmonth',
  'endofyear',
] as const;

export type SupportedJqlDateFunction = (typeof SUPPORTED_JQL_DATE_FUNCTIONS)[number];

export function isSupportedJqlDateFunction(name: string): name is SupportedJqlDateFunction {
  return (SUPPORTED_JQL_DATE_FUNCTIONS as readonly string[]).includes(name.toLowerCase());
}

/** Parse a field/literal value into a comparable timestamp or number. */
export function parseComparable(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return null;
  const s = String(value).trim();
  if (s === '') return null;
  if (NUMBER_RE.test(s)) return Number(s);

  const dateOnly = DATE_ONLY_RE.exec(s);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]) - 1;
    const d = Number(dateOnly[3]);
    return new Date(y, m, d).getTime();
  }

  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : ms;
}

export function compareOrdered(left: unknown, op: '<' | '<=' | '>' | '>=', right: unknown): boolean {
  const l = parseComparable(left);
  const r = typeof right === 'number' ? right : parseComparable(right);
  if (l === null || r === null) return false;
  switch (op) {
    case '<':
      return l < r;
    case '<=':
      return l <= r;
    case '>':
      return l > r;
    case '>=':
      return l >= r;
    default:
      return false;
  }
}

function parseIncrement(raw: string | undefined, defaultUnit: JqlDateUnit): { amount: number; unit: JqlDateUnit } {
  if (raw === undefined || raw.trim() === '') return { amount: 0, unit: defaultUnit };
  const m = INCREMENT_RE.exec(raw.trim());
  if (!m) throw new Error(`Invalid date increment: "${raw}"`);
  const sign = m[1] === '-' ? -1 : 1;
  return { amount: sign * Number(m[2]), unit: (m[3] as JqlDateUnit | undefined) ?? defaultUnit };
}

function applyIncrement(base: Date, amount: number, unit: JqlDateUnit): Date {
  const d = new Date(base.getTime());
  switch (unit) {
    case 'y':
      d.setFullYear(d.getFullYear() + amount);
      break;
    case 'M':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'w':
      d.setDate(d.getDate() + amount * 7);
      break;
    case 'd':
      d.setDate(d.getDate() + amount);
      break;
    case 'h':
      d.setHours(d.getHours() + amount);
      break;
    case 'm':
      d.setMinutes(d.getMinutes() + amount);
      break;
    default:
      break;
  }
  return d;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** Monday-based week (ISO-8601). */
function startOfWeek(d: Date): Date {
  const dayStart = startOfDay(d);
  const day = dayStart.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  dayStart.setDate(dayStart.getDate() + diff);
  return dayStart;
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date): Date {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(d: Date): Date {
  return endOfDay(new Date(d.getFullYear(), 11, 31));
}

function shifted(now: Date, args: string[], defaultUnit: JqlDateUnit): Date {
  if (args.length > 1) throw new Error(`Date function accepts at most one increment argument, got ${args.length}`);
  const { amount, unit } = parseIncrement(args[0], defaultUnit);
  return applyIncrement(now, amount, unit);
}

/** Evaluate a supported JQL date function to a millisecond timestamp. */
export function evaluateJqlDateFunction(name: string, args: string[], now: Date): number {
  const fn = name.toLowerCase();
  if (!isSupportedJqlDateFunction(fn)) {
    throw new Error(`Unsupported function: ${name}()`);
  }

  switch (fn) {
    case 'now':
      if (args.length > 0) throw new Error('now() does not accept arguments');
      return now.getTime();
    case 'startofday':
      return startOfDay(shifted(now, args, 'd')).getTime();
    case 'endofday':
      return endOfDay(shifted(now, args, 'd')).getTime();
    case 'startofweek':
      return startOfWeek(shifted(now, args, 'w')).getTime();
    case 'endofweek':
      return endOfWeek(shifted(now, args, 'w')).getTime();
    case 'startofmonth':
      return startOfMonth(shifted(now, args, 'M')).getTime();
    case 'endofmonth':
      return endOfMonth(shifted(now, args, 'M')).getTime();
    case 'startofyear':
      return startOfYear(shifted(now, args, 'y')).getTime();
    case 'endofyear':
      return endOfYear(shifted(now, args, 'y')).getTime();
    default:
      throw new Error(`Unsupported function: ${name}()`);
  }
}
