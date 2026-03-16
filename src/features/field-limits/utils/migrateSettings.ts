import type { FieldLimitsSettings, FieldLimit } from '../types';
import { CalcType } from '../types';

/**
 * Старый формат FieldLimit (без явного calcType).
 * CalcType определялся по формату fieldValue.
 */
interface OldFieldLimit {
  fieldValue: string;
  fieldId: string;
  limit: number;
  columns: string[];
  swimlanes: string[];
  bkgColor?: string;
  visualValue: string;
}

/**
 * Проверяет, является ли лимит старым форматом (без calcType).
 */
export function isOldFormat(limit: unknown): boolean {
  return typeof limit === 'object' && limit !== null && 'fieldValue' in limit && !('calcType' in limit);
}

/**
 * Мигрирует один лимит из старого формата в новый.
 *
 * Правила:
 * - "∑(nums)" → SUM_NUMBERS, fieldValue: ""
 * - "∑Team" → EXACT_VALUE, fieldValue: "Team" (BY_SUM_VALUE удалён, fallback)
 * - "Bug || Task" → MULTIPLE_VALUES, fieldValue: "Bug, Task"
 * - "Pro" → EXACT_VALUE, fieldValue: "Pro"
 */
export function migrateFieldLimit(oldLimit: OldFieldLimit): FieldLimit {
  const { fieldValue, ...rest } = oldLimit;

  // ∑(numbers) → SUM_NUMBERS
  if (/∑\([A-Za-z0-9]*\)/i.test(fieldValue)) {
    return { ...rest, calcType: CalcType.SUM_NUMBERS, fieldValue: '' };
  }

  // ∑value → EXACT_VALUE (BY_SUM_VALUE removed, fallback)
  if (fieldValue.startsWith('∑')) {
    const cleanValue = fieldValue.replace(/^∑/, '');
    return { ...rest, calcType: CalcType.EXACT_VALUE, fieldValue: cleanValue };
  }

  // val1 || val2 → MULTIPLE_VALUES
  if (/\s*\|\|\s*/.test(fieldValue)) {
    const values = fieldValue
      .split(/\s*\|\|\s*/)
      .map(v => v.trim())
      .filter(Boolean);
    return {
      ...rest,
      calcType: CalcType.MULTIPLE_VALUES,
      fieldValue: values.join(', '),
    };
  }

  // plain value → EXACT_VALUE
  return { ...rest, calcType: CalcType.EXACT_VALUE, fieldValue };
}

/**
 * Мигрирует настройки: если лимиты в старом формате — конвертирует в новый.
 * Идемпотентная операция — уже мигрированные settings возвращаются as-is.
 */
export function migrateSettings(settings: unknown): FieldLimitsSettings {
  if (!settings || typeof settings !== 'object') {
    return { limits: {} };
  }

  const raw = settings as { limits?: Record<string, unknown> };
  if (!raw.limits || typeof raw.limits !== 'object') {
    return { limits: {} };
  }

  const migratedLimits: Record<string, FieldLimit> = {};

  for (const [key, limit] of Object.entries(raw.limits)) {
    if (isOldFormat(limit)) {
      migratedLimits[key] = migrateFieldLimit(limit as OldFieldLimit);
    } else {
      migratedLimits[key] = limit as FieldLimit;
    }
  }

  for (const limit of Object.values(migratedLimits)) {
    limit.columns = limit.columns.map(String);
    limit.swimlanes = limit.swimlanes.map(String);
  }

  return { limits: migratedLimits };
}
