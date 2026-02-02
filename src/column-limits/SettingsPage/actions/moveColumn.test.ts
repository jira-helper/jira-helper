import { describe, it, expect, beforeEach } from 'vitest';
import { moveColumn } from './moveColumn';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';
import { WITHOUT_GROUP_ID } from '../../types';
import type { Column } from '../../types';

describe('moveColumn', () => {
  beforeEach(() => {
    useColumnLimitsSettingsUIStore.setState(useColumnLimitsSettingsUIStore.getInitialState());
  });

  it('should move column via store action', () => {
    const col: Column = { id: 'col1', name: 'To Do' };
    useColumnLimitsSettingsUIStore.getState().actions.setData({
      withoutGroupColumns: [col],
      groups: [],
    });

    moveColumn(col, WITHOUT_GROUP_ID, 'newGroup');

    const state = useColumnLimitsSettingsUIStore.getState();
    expect(state.data.withoutGroupColumns).toEqual([]);
    expect(state.data.groups[0].columns).toEqual([col]);
    expect(state.data.groups[0].id).toBe('newGroup');
  });
});
