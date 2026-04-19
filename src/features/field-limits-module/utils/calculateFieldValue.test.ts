import { describe, it, expect } from 'vitest';
import {
  countByHasField,
  countByCard,
  countBySumNumbers,
  countByMultipleValues,
  calculateFieldValue,
} from './calculateFieldValue';
import { CalcType } from '../types';

describe('countByHasField', () => {
  it('should return 1 when at least one text is non-empty', () => {
    expect(countByHasField(['Pro'])).toBe(1);
    expect(countByHasField([''])).toBe(0);
    expect(countByHasField(['', 'x'])).toBe(1);
    expect(countByHasField(['a', 'b'])).toBe(1);
  });

  it('should return 0 when all texts are empty', () => {
    expect(countByHasField([])).toBe(0);
    expect(countByHasField(['', ''])).toBe(0);
  });
});

describe('countByCard', () => {
  it('should return 1 when text contains exact fieldValue', () => {
    expect(countByCard(['Pro'], 'Pro')).toBe(1);
    expect(countByCard(['Bug'], 'Bug')).toBe(1);
  });

  it('should return 1 when value appears in comma-separated list', () => {
    expect(countByCard(['Pro, Dev, QA'], 'Pro')).toBe(1);
    expect(countByCard(['A, B, C'], 'B')).toBe(1);
  });

  it('should return 0 when value is absent', () => {
    expect(countByCard(['Pro', 'Dev'], 'QA')).toBe(0);
    expect(countByCard(['A, B'], 'C')).toBe(0);
  });

  it('should return 0 for empty array', () => {
    expect(countByCard([], 'Pro')).toBe(0);
  });

  it('should trim parts before comparison', () => {
    expect(countByCard(['  Pro  '], 'Pro')).toBe(1);
    expect(countByCard([' Pro , Dev '], 'Pro')).toBe(1);
  });
});

describe('countBySumNumbers', () => {
  it('should sum integer values', () => {
    expect(countBySumNumbers(['1', '2', '3'])).toBe(6);
  });

  it('should sum fractional values', () => {
    expect(countBySumNumbers(['1.5', '2.5'])).toBe(4);
  });

  it('should treat NaN as 0', () => {
    expect(countBySumNumbers(['abc', 'xyz'])).toBe(0);
    expect(countBySumNumbers(['1', 'abc', '2'])).toBe(3);
  });

  it('should return 0 for empty array', () => {
    expect(countBySumNumbers([])).toBe(0);
  });
});

describe('countByMultipleValues', () => {
  it('should return 1 when one of values matches (comma separator)', () => {
    expect(countByMultipleValues(['Bug'], 'Bug, Task')).toBe(1);
    expect(countByMultipleValues(['Task'], 'Bug, Task')).toBe(1);
  });

  it('should return 0 when none match', () => {
    expect(countByMultipleValues(['Pro'], 'Bug, Task')).toBe(0);
  });

  it('should handle multiple values in fieldValue', () => {
    expect(countByMultipleValues(['C'], 'A, B, C')).toBe(1);
  });

  it('should return 0 for empty array', () => {
    expect(countByMultipleValues([], 'Bug, Task')).toBe(0);
  });

  it('should handle comma-separated texts', () => {
    expect(countByMultipleValues(['Bug, Task'], 'Bug, Task')).toBe(1);
  });

  it('should trim values with spaces around comma', () => {
    expect(countByMultipleValues(['Bug'], 'Bug , Task')).toBe(1);
  });
});

describe('calculateFieldValue', () => {
  it('should dispatch to countByHasField for HAS_FIELD', () => {
    expect(calculateFieldValue(['Pro'], '', CalcType.HAS_FIELD)).toBe(1);
    expect(calculateFieldValue([], '', CalcType.HAS_FIELD)).toBe(0);
    expect(calculateFieldValue([''], '', CalcType.HAS_FIELD)).toBe(0);
  });

  it('should dispatch to countByCard for EXACT_VALUE', () => {
    expect(calculateFieldValue(['Pro'], 'Pro', CalcType.EXACT_VALUE)).toBe(1);
    expect(calculateFieldValue(['Dev'], 'Pro', CalcType.EXACT_VALUE)).toBe(0);
  });

  it('should dispatch to countBySumNumbers for SUM_NUMBERS', () => {
    expect(calculateFieldValue(['1', '2', '3'], '', CalcType.SUM_NUMBERS)).toBe(6);
  });

  it('should dispatch to countByMultipleValues for MULTIPLE_VALUES', () => {
    expect(calculateFieldValue(['Bug'], 'Bug, Task', CalcType.MULTIPLE_VALUES)).toBe(1);
  });

  it('should default to countByCard for unknown calcType', () => {
    expect(calculateFieldValue(['Pro'], 'Pro', 'unknown' as CalcType)).toBe(1);
  });
});
