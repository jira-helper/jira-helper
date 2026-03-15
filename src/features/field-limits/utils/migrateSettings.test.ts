import { describe, it, expect } from 'vitest';
import { isOldFormat, migrateFieldLimit, migrateSettings } from './migrateSettings';
import { CalcType } from '../types';

describe('isOldFormat', () => {
  it('returns true for object without calcType', () => {
    expect(isOldFormat({ fieldValue: 'Pro', fieldId: 'x' })).toBe(true);
  });

  it('returns false for object with calcType', () => {
    expect(isOldFormat({ fieldValue: 'Pro', calcType: CalcType.EXACT_VALUE })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOldFormat(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isOldFormat(undefined)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isOldFormat('string')).toBe(false);
    expect(isOldFormat(123)).toBe(false);
    expect(isOldFormat(true)).toBe(false);
  });
});

describe('migrateFieldLimit', () => {
  const baseLimit = {
    fieldId: 'customfield_10001',
    limit: 5,
    columns: ['col1'],
    swimlanes: ['swim1'],
    visualValue: 'Pro',
  };

  it('plain text "Pro" → exact_value, fieldValue: "Pro"', () => {
    const result = migrateFieldLimit({ ...baseLimit, fieldValue: 'Pro' });
    expect(result.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.fieldValue).toBe('Pro');
  });

  it('sum prefix "∑Team" → exact_value, fieldValue: "Team"', () => {
    const result = migrateFieldLimit({ ...baseLimit, fieldValue: '∑Team' });
    expect(result.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.fieldValue).toBe('Team');
  });

  it('sum numbers "∑(SP)" → sum_numbers, fieldValue: ""', () => {
    const result = migrateFieldLimit({ ...baseLimit, fieldValue: '∑(SP)' });
    expect(result.calcType).toBe(CalcType.SUM_NUMBERS);
    expect(result.fieldValue).toBe('');
  });

  it('multiple values "Bug || Task" → multiple_values, fieldValue: "Bug, Task"', () => {
    const result = migrateFieldLimit({
      ...baseLimit,
      fieldValue: 'Bug || Task',
    });
    expect(result.calcType).toBe(CalcType.MULTIPLE_VALUES);
    expect(result.fieldValue).toBe('Bug, Task');
  });

  it('preserves other fields (fieldId, limit, columns, swimlanes, bkgColor, visualValue)', () => {
    const oldLimit = {
      ...baseLimit,
      fieldValue: 'Pro',
      bkgColor: '#ff0000',
    };
    const result = migrateFieldLimit(oldLimit);
    expect(result.fieldId).toBe(oldLimit.fieldId);
    expect(result.limit).toBe(oldLimit.limit);
    expect(result.columns).toEqual(oldLimit.columns);
    expect(result.swimlanes).toEqual(oldLimit.swimlanes);
    expect(result.bkgColor).toBe(oldLimit.bkgColor);
    expect(result.visualValue).toBe(oldLimit.visualValue);
  });

  it('empty fieldValue "" → exact_value, fieldValue: ""', () => {
    const result = migrateFieldLimit({ ...baseLimit, fieldValue: '' });
    expect(result.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.fieldValue).toBe('');
  });

  it('only "∑" → exact_value, fieldValue: ""', () => {
    const result = migrateFieldLimit({ ...baseLimit, fieldValue: '∑' });
    expect(result.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.fieldValue).toBe('');
  });

  it('fieldValue with spaces "  Bug  ||  Task  " → correct split', () => {
    const result = migrateFieldLimit({
      ...baseLimit,
      fieldValue: '  Bug  ||  Task  ',
    });
    expect(result.calcType).toBe(CalcType.MULTIPLE_VALUES);
    expect(result.fieldValue).toBe('Bug, Task');
  });

  it('triple value "Bug || Task || Story" → "Bug, Task, Story"', () => {
    const result = migrateFieldLimit({
      ...baseLimit,
      fieldValue: 'Bug || Task || Story',
    });
    expect(result.calcType).toBe(CalcType.MULTIPLE_VALUES);
    expect(result.fieldValue).toBe('Bug, Task, Story');
  });
});

describe('migrateSettings', () => {
  const baseLimit = {
    fieldId: 'cf',
    limit: 5,
    columns: [] as string[],
    swimlanes: [] as string[],
    visualValue: 'x',
  };

  it('migrates multiple limits of different types', () => {
    const settings = {
      limits: {
        key1: { ...baseLimit, fieldValue: 'Pro' },
        key2: { ...baseLimit, fieldValue: '∑Team' },
        key3: { ...baseLimit, fieldValue: '∑(SP)' },
        key4: { ...baseLimit, fieldValue: 'Bug || Task' },
      },
    };
    const result = migrateSettings(settings);
    expect(result.limits.key1.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.limits.key2.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.limits.key3.calcType).toBe(CalcType.SUM_NUMBERS);
    expect(result.limits.key4.calcType).toBe(CalcType.MULTIPLE_VALUES);
  });

  it('already new format (with calcType) → returns as-is (idempotent)', () => {
    const settings = {
      limits: {
        key1: {
          ...baseLimit,
          calcType: CalcType.EXACT_VALUE,
          fieldValue: 'Pro',
        },
      },
    };
    const result = migrateSettings(settings);
    expect(result.limits.key1).toBe(settings.limits.key1);
    expect(result.limits.key1.calcType).toBe(CalcType.EXACT_VALUE);
  });

  it('empty settings → { limits: {} }', () => {
    expect(migrateSettings({})).toEqual({ limits: {} });
    expect(migrateSettings({ limits: {} })).toEqual({ limits: {} });
  });

  it('null/undefined → { limits: {} }', () => {
    expect(migrateSettings(null)).toEqual({ limits: {} });
    expect(migrateSettings(undefined)).toEqual({ limits: {} });
  });

  it('mixed format (some old, some new) → correct migration', () => {
    const newLimit = {
      ...baseLimit,
      calcType: CalcType.EXACT_VALUE,
      fieldValue: 'AlreadyNew',
    };
    const settings = {
      limits: {
        oldKey: { ...baseLimit, fieldValue: 'Pro' },
        newKey: newLimit,
      },
    };
    const result = migrateSettings(settings);
    expect(result.limits.oldKey.calcType).toBe(CalcType.EXACT_VALUE);
    expect(result.limits.oldKey.fieldValue).toBe('Pro');
    expect(result.limits.newKey).toBe(newLimit);
  });
});
