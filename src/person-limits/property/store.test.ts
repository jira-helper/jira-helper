import { describe, it, expect, beforeEach } from 'vitest';
import { usePersonWipLimitsPropertyStore } from './store';
import type { PersonLimit } from './types';

describe('personWipLimitsPropertyStore', () => {
  beforeEach(() => {
    usePersonWipLimitsPropertyStore.getState().actions.reset();
  });

  it('should have initial empty limits', () => {
    const state = usePersonWipLimitsPropertyStore.getState();
    expect(state.data.limits).toEqual([]);
    expect(state.state).toBe('initial');
  });

  it('should setData and setLimits', () => {
    const limit: PersonLimit = {
      id: 1,
      person: {
        name: 'u',
        displayName: 'U',
        self: '',
        avatar: '',
      },
      limit: 5,
      columns: [],
      swimlanes: [],
    };

    usePersonWipLimitsPropertyStore.getState().actions.setData({ limits: [limit] });
    expect(usePersonWipLimitsPropertyStore.getState().data.limits).toHaveLength(1);
    expect(usePersonWipLimitsPropertyStore.getState().data.limits[0].limit).toBe(5);

    usePersonWipLimitsPropertyStore.getState().actions.setLimits([]);
    expect(usePersonWipLimitsPropertyStore.getState().data.limits).toEqual([]);
  });

  it('should reset to initial state', () => {
    usePersonWipLimitsPropertyStore.getState().actions.setData({
      limits: [
        {
          id: 1,
          person: { name: 'u', displayName: 'U', self: '', avatar: '' },
          limit: 1,
          columns: [],
          swimlanes: [],
        },
      ],
    });
    usePersonWipLimitsPropertyStore.getState().actions.reset();
    expect(usePersonWipLimitsPropertyStore.getState().data.limits).toEqual([]);
    expect(usePersonWipLimitsPropertyStore.getState().state).toBe('initial');
  });
});
