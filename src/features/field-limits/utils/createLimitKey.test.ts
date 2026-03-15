import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLimitKey } from './createLimitKey';

describe('createLimitKey', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should contain @@ separator in key format', () => {
    const key = createLimitKey({ fieldValue: 'Pro', fieldId: 'customfield_123' });
    expect(key).toContain('@@');
    expect(key.split('@@')).toHaveLength(3);
  });

  it('should contain fieldId and fieldValue', () => {
    const key = createLimitKey({ fieldValue: 'Pro', fieldId: 'customfield_123' });
    expect(key).toContain('customfield_123');
    expect(key).toContain('Pro');
  });

  it('should produce different keys for consecutive calls with different timestamps', () => {
    const key1 = createLimitKey({ fieldValue: 'Pro', fieldId: 'cf1' });
    vi.advanceTimersByTime(1);
    const key2 = createLimitKey({ fieldValue: 'Pro', fieldId: 'cf1' });
    expect(key1).not.toBe(key2);
  });

  it('should produce same key when called at same timestamp', () => {
    const key1 = createLimitKey({ fieldValue: 'Pro', fieldId: 'cf1' });
    const key2 = createLimitKey({ fieldValue: 'Pro', fieldId: 'cf1' });
    expect(key1).toBe(key2);
  });

  it('should use ISO format for timestamp', () => {
    const key = createLimitKey({ fieldValue: 'Pro', fieldId: 'cf1' });
    const [timestamp] = key.split('@@');
    expect(timestamp).toBe('2025-03-13T12:00:00.000Z');
  });
});
