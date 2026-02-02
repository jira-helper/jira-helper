import { describe, it, expect, beforeEach } from 'vitest';
import { useColumnLimitsPropertyStore } from './store';
import type { WipLimitsProperty } from '../types';

describe('columnLimitsPropertyStore', () => {
  beforeEach(() => {
    useColumnLimitsPropertyStore.getState().actions.reset();
  });

  it('should have initial empty data', () => {
    const state = useColumnLimitsPropertyStore.getState();
    expect(state.data).toEqual({});
    expect(state.state).toBe('initial');
  });

  it('should setData', () => {
    const data: WipLimitsProperty = {
      group1: {
        columns: ['col1', 'col2'],
        max: 5,
        customHexColor: '#ff0000',
      },
    };

    useColumnLimitsPropertyStore.getState().actions.setData(data);
    expect(useColumnLimitsPropertyStore.getState().data).toEqual(data);
    expect(useColumnLimitsPropertyStore.getState().data.group1?.max).toBe(5);
  });

  it('should setState', () => {
    useColumnLimitsPropertyStore.getState().actions.setState('loading');
    expect(useColumnLimitsPropertyStore.getState().state).toBe('loading');

    useColumnLimitsPropertyStore.getState().actions.setState('loaded');
    expect(useColumnLimitsPropertyStore.getState().state).toBe('loaded');
  });

  it('should reset to initial state', () => {
    useColumnLimitsPropertyStore.getState().actions.setData({
      group1: { columns: ['col1'], max: 3 },
    });
    useColumnLimitsPropertyStore.getState().actions.reset();
    expect(useColumnLimitsPropertyStore.getState().data).toEqual({});
    expect(useColumnLimitsPropertyStore.getState().state).toBe('initial');
  });
});
