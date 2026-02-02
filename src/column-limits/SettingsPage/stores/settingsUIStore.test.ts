import { describe, it, expect, beforeEach } from 'vitest';
import { useColumnLimitsSettingsUIStore } from './settingsUIStore';
import { WITHOUT_GROUP_ID } from '../../types';
import type { Column, UIGroup } from '../../types';

describe('columnLimitsSettingsUIStore', () => {
  beforeEach(() => {
    useColumnLimitsSettingsUIStore.setState(useColumnLimitsSettingsUIStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have empty withoutGroupColumns and groups', () => {
      const state = useColumnLimitsSettingsUIStore.getState();
      expect(state.data.withoutGroupColumns).toEqual([]);
      expect(state.data.groups).toEqual([]);
      expect(state.data.issueTypeSelectorStates).toEqual({});
      expect(state.state).toBe('initial');
    });
  });

  describe('setData', () => {
    it('should set withoutGroupColumns and groups and update state to loaded', () => {
      const withoutGroupColumns: Column[] = [{ id: 'col1', name: 'To Do' }];
      const groups: UIGroup[] = [{ id: 'g1', columns: [{ id: 'col2', name: 'In Progress' }], max: 5 }];

      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns,
        groups,
      });

      const state = useColumnLimitsSettingsUIStore.getState();
      expect(state.data.withoutGroupColumns).toEqual(withoutGroupColumns);
      expect(state.data.groups).toEqual(groups);
      expect(state.state).toBe('loaded');
    });
  });

  describe('setGroupLimit', () => {
    it('should update group max', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], max: 3 }],
      });

      useColumnLimitsSettingsUIStore.getState().actions.setGroupLimit('g1', 10);

      expect(useColumnLimitsSettingsUIStore.getState().data.groups[0].max).toBe(10);
    });
  });

  describe('setGroupColor', () => {
    it('should update group customHexColor', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [], customHexColor: '#000' }],
      });

      useColumnLimitsSettingsUIStore.getState().actions.setGroupColor('g1', '#fff');

      expect(useColumnLimitsSettingsUIStore.getState().data.groups[0].customHexColor).toBe('#fff');
    });
  });

  describe('moveColumn', () => {
    it('should move column from withoutGroup to new group', () => {
      const col: Column = { id: 'col1', name: 'To Do' };
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [col],
        groups: [],
      });

      useColumnLimitsSettingsUIStore.getState().actions.moveColumn(col, WITHOUT_GROUP_ID, 'newGroup');

      const state = useColumnLimitsSettingsUIStore.getState();
      expect(state.data.withoutGroupColumns).toEqual([]);
      expect(state.data.groups).toHaveLength(1);
      expect(state.data.groups[0].id).toBe('newGroup');
      expect(state.data.groups[0].columns).toEqual([col]);
      expect(state.data.groups[0].max).toBe(100);
    });

    it('should move column from one group to another', () => {
      const col: Column = { id: 'col1', name: 'To Do' };
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [],
        groups: [
          { id: 'g1', columns: [col], max: 5 },
          { id: 'g2', columns: [], max: 3 },
        ],
      });

      useColumnLimitsSettingsUIStore.getState().actions.moveColumn(col, 'g1', 'g2');

      const state = useColumnLimitsSettingsUIStore.getState();
      expect(state.data.groups).toHaveLength(1);
      expect(state.data.groups[0].id).toBe('g2');
      expect(state.data.groups[0].columns).toEqual([col]);
    });

    it('should move column from group to withoutGroup', () => {
      const col: Column = { id: 'col1', name: 'To Do' };
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [],
        groups: [{ id: 'g1', columns: [col], max: 5 }],
      });

      useColumnLimitsSettingsUIStore.getState().actions.moveColumn(col, 'g1', WITHOUT_GROUP_ID);

      const state = useColumnLimitsSettingsUIStore.getState();
      expect(state.data.withoutGroupColumns).toEqual([col]);
      expect(state.data.groups).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [{ id: 'c1', name: 'Col' }],
        groups: [{ id: 'g1', columns: [], max: 1 }],
      });
      useColumnLimitsSettingsUIStore.getState().actions.reset();

      const state = useColumnLimitsSettingsUIStore.getState();
      expect(state.data.withoutGroupColumns).toEqual([]);
      expect(state.data.groups).toEqual([]);
      expect(state.state).toBe('initial');
    });
  });
});
