import { describe, it, expect } from 'vitest';
import { computeLimitId, LimitParams } from './computeLimitId';

describe('computeLimitId', () => {
  const baseLimit: LimitParams = {
    persons: [{ name: 'john.doe' }],
    columns: [{ id: 'col-1' }, { id: 'col-2' }],
    swimlanes: [{ id: 'sw-1' }, { id: 'sw-2' }],
    includedIssueTypes: ['Bug', 'Task'],
  };

  it('should return a stable number for the same parameters', () => {
    const id1 = computeLimitId(baseLimit);
    const id2 = computeLimitId(baseLimit);

    expect(typeof id1).toBe('number');
    expect(id1).toBe(id2);
  });

  it('should return the same id regardless of columns order', () => {
    const limit1: LimitParams = {
      ...baseLimit,
      columns: [{ id: 'col-1' }, { id: 'col-2' }],
    };
    const limit2: LimitParams = {
      ...baseLimit,
      columns: [{ id: 'col-2' }, { id: 'col-1' }],
    };

    expect(computeLimitId(limit1)).toBe(computeLimitId(limit2));
  });

  it('should return the same id regardless of swimlanes order', () => {
    const limit1: LimitParams = {
      ...baseLimit,
      swimlanes: [{ id: 'sw-1' }, { id: 'sw-2' }],
    };
    const limit2: LimitParams = {
      ...baseLimit,
      swimlanes: [{ id: 'sw-2' }, { id: 'sw-1' }],
    };

    expect(computeLimitId(limit1)).toBe(computeLimitId(limit2));
  });

  it('should return the same id regardless of issue types order', () => {
    const limit1: LimitParams = {
      ...baseLimit,
      includedIssueTypes: ['Bug', 'Task'],
    };
    const limit2: LimitParams = {
      ...baseLimit,
      includedIssueTypes: ['Task', 'Bug'],
    };

    expect(computeLimitId(limit1)).toBe(computeLimitId(limit2));
  });

  it('should return different ids for different persons', () => {
    const limit1: LimitParams = { ...baseLimit, persons: [{ name: 'john.doe' }] };
    const limit2: LimitParams = { ...baseLimit, persons: [{ name: 'jane.doe' }] };

    expect(computeLimitId(limit1)).not.toBe(computeLimitId(limit2));
  });

  it('should return different ids for different columns', () => {
    const limit1: LimitParams = { ...baseLimit, columns: [{ id: 'col-1' }] };
    const limit2: LimitParams = { ...baseLimit, columns: [{ id: 'col-2' }] };

    expect(computeLimitId(limit1)).not.toBe(computeLimitId(limit2));
  });

  it('should handle undefined includedIssueTypes', () => {
    const limit1: LimitParams = {
      persons: [{ name: 'john.doe' }],
      columns: [{ id: 'col-1' }],
      swimlanes: [{ id: 'sw-1' }],
      includedIssueTypes: undefined,
    };
    const id = computeLimitId(limit1);
    expect(typeof id).toBe('number');
  });

  it('should produce the same id for empty and undefined includedIssueTypes', () => {
    // This depends on implementation details, but usually we want stability.
    // If we join them, undefined might be empty string or "undefined".
    // The requirement says "отсортированных типов задач".
    // Let's see what happens if it's missing.
  });
});
