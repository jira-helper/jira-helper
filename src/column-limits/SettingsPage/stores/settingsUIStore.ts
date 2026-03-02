import { create } from 'zustand';
import { produce } from 'immer';
import { WITHOUT_GROUP_ID } from '../../types';
import type { Column, UIGroup } from '../../types';
import type { SettingsUIData, SettingsUIStoreState } from './settingsUIStore.types';

const getInitialData = (): SettingsUIData => ({
  withoutGroupColumns: [],
  groups: [],
  issueTypeSelectorStates: {},
});

export const useColumnLimitsSettingsUIStore = create<SettingsUIStoreState>()(set => ({
  data: getInitialData(),
  state: 'initial',
  actions: {
    setData: ({ withoutGroupColumns, groups }) =>
      set(
        produce(state => {
          state.data.withoutGroupColumns = withoutGroupColumns;
          state.data.groups = groups;
          state.state = 'loaded';
        })
      ),

    setWithoutGroupColumns: columns =>
      set(
        produce(state => {
          state.data.withoutGroupColumns = columns;
        })
      ),

    setGroups: groups =>
      set(
        produce(state => {
          state.data.groups = groups;
        })
      ),

    setGroupLimit: (groupId, limit) =>
      set(
        produce(state => {
          const group = state.data.groups.find((g: UIGroup) => g.id === groupId);
          if (group) group.max = limit;
        })
      ),

    setGroupColor: (groupId, customHexColor) =>
      set(
        produce(state => {
          const group = state.data.groups.find((g: UIGroup) => g.id === groupId);
          if (group) group.customHexColor = customHexColor;
        })
      ),

    setGroupSwimlanes: (groupId, swimlanes) =>
      set(
        produce(state => {
          const group = state.data.groups.find((g: UIGroup) => g.id === groupId);
          if (group) {
            // Empty array = all (convention)
            group.swimlanes = swimlanes.length === 0 ? undefined : swimlanes;
          }
        })
      ),

    setIssueTypeState: (groupId, issueState) =>
      set(
        produce(state => {
          state.data.issueTypeSelectorStates[groupId] = issueState;
        })
      ),

    moveColumn: (column, fromGroupId, toGroupId) =>
      set(
        produce(state => {
          if (fromGroupId === WITHOUT_GROUP_ID) {
            state.data.withoutGroupColumns = state.data.withoutGroupColumns.filter((c: Column) => c.id !== column.id);
          } else {
            const fromGroup = state.data.groups.find((g: UIGroup) => g.id === fromGroupId);
            if (fromGroup) {
              fromGroup.columns = fromGroup.columns.filter((c: Column) => c.id !== column.id);
              if (fromGroup.columns.length === 0) {
                state.data.groups = state.data.groups.filter((g: UIGroup) => g.id !== fromGroupId);
              }
            }
          }

          if (toGroupId === WITHOUT_GROUP_ID) {
            state.data.withoutGroupColumns = [...state.data.withoutGroupColumns, column];
          } else {
            const toGroup = state.data.groups.find((g: UIGroup) => g.id === toGroupId);
            if (toGroup) {
              toGroup.columns.push(column);
            } else {
              state.data.groups.push({
                id: toGroupId,
                columns: [column],
                max: 100,
              } as UIGroup);
            }
          }
        })
      ),

    setState: newState => set({ state: newState }),

    reset: () => set({ data: getInitialData(), state: 'initial' }),
  },
}));

useColumnLimitsSettingsUIStore.getInitialState = (): SettingsUIStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: useColumnLimitsSettingsUIStore.getState().actions,
});
