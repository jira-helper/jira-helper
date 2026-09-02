import { describe, it, expect } from 'vitest';
import type { WipLimitsProperty } from '../types';
import { stripUnknownWipColumnIds } from './utils';

describe('stripUnknownWipColumnIds', () => {
  it('returns unchanged when all column ids are known', () => {
    const property: WipLimitsProperty = {
      G1: { columns: ['115', '116'], max: 5 },
    };

    const result = stripUnknownWipColumnIds(property, ['115', '116']);

    expect(result.changed).toBe(false);
    expect(result.cleaned).toEqual(property);
  });

  it('strips unknown column ids but keeps the group when some columns remain', () => {
    const property: WipLimitsProperty = {
      G1: {
        columns: ['115', '999', '116'],
        max: 5,
        customHexColor: '#ff5630',
        includedIssueTypes: ['Task'],
        swimlanes: [{ id: 's1', name: 'Lane1' }],
      },
    };

    const result = stripUnknownWipColumnIds(property, ['115', '116']);

    expect(result.changed).toBe(true);
    expect(result.cleaned).toEqual({
      G1: {
        columns: ['115', '116'],
        max: 5,
        customHexColor: '#ff5630',
        includedIssueTypes: ['Task'],
        swimlanes: [{ id: 's1', name: 'Lane1' }],
      },
    });
  });

  it('removes a group when all its column ids are unknown', () => {
    const property: WipLimitsProperty = {
      G1: { columns: ['999'], max: 5 },
      G2: { columns: ['115'], max: 3 },
    };

    const result = stripUnknownWipColumnIds(property, ['115']);

    expect(result.changed).toBe(true);
    expect(result.cleaned).toEqual({
      G2: { columns: ['115'], max: 3 },
    });
  });

  it('preserves group and column order', () => {
    const property: WipLimitsProperty = {
      Alpha: { columns: ['116', '115'], max: 2 },
      Beta: { columns: ['117', '999'], max: 4 },
      Gamma: { columns: ['888'], max: 1 },
    };

    const result = stripUnknownWipColumnIds(property, ['115', '116', '117']);

    expect(result.cleaned).toEqual({
      Alpha: { columns: ['116', '115'], max: 2 },
      Beta: { columns: ['117'], max: 4 },
    });
  });

  it('returns unchanged for empty property', () => {
    const result = stripUnknownWipColumnIds({}, ['115']);

    expect(result.changed).toBe(false);
    expect(result.cleaned).toEqual({});
  });

  it('accepts knownColumnIds as any iterable', () => {
    const property: WipLimitsProperty = {
      G1: { columns: ['115', '999'], max: 5 },
    };
    const known = new Set(['115']);

    const result = stripUnknownWipColumnIds(property, known);

    expect(result.changed).toBe(true);
    expect(result.cleaned).toEqual({ G1: { columns: ['115'], max: 5 } });
  });

  it('treats numeric editmodel ids as the same as string property ids', () => {
    const property: WipLimitsProperty = {
      G1: { columns: ['115', '116'], max: 5 },
    };

    const result = stripUnknownWipColumnIds(property, [115, 116]);

    expect(result.changed).toBe(false);
    expect(result.cleaned).toEqual(property);
  });

  it('does not strip when the known column list is empty', () => {
    const property: WipLimitsProperty = {
      G1: { columns: ['115'], max: 5 },
    };

    const result = stripUnknownWipColumnIds(property, []);

    expect(result.changed).toBe(false);
    expect(result.cleaned).toEqual(property);
  });
});
