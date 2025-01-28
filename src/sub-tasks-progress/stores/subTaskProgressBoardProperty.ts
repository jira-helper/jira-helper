import { create } from 'zustand';
import { produce } from 'immer';
import { State } from './subTaskProgressBoardProperty.types';
import { BoardProperty } from '../types';

const initialData: Required<BoardProperty> = {
  columnsToTrack: [],
  selectedColorScheme: 'jira',
  statusMapping: {},
  newStatusMapping: {},
  countSubtasksOfIssue: true,
  countIssuesInEpic: true,
  countLinkedIssues: true,
  useCustomColorScheme: false,
  ignoredGroups: [],
  groupingField: 'project',
};

export const useSubTaskProgressBoardPropertyStore = create<State>()(set => ({
  data: initialData,
  state: 'initial',
  actions: {
    setData: data => set({ data: { ...initialData, ...data } }),
    setColumns: columns =>
      set(
        produce((state: State) => {
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
        })
      ),
    setUseCustomColorScheme: (useCustomColorScheme: boolean) =>
      set(
        produce((state: State) => {
          state.data.useCustomColorScheme = useCustomColorScheme;
          if (!useCustomColorScheme) {
            state.data.selectedColorScheme = 'jira';
          }
        })
      ),
    setSelectedColorScheme: colorScheme =>
      set(
        produce((state: State) => {
          state.data.selectedColorScheme = colorScheme;
        })
      ),
    setState: state => set({ state }),
    setGroupingField: groupingField =>
      set(
        produce((state: State) => {
          state.data.groupingField = groupingField;
          state.data.ignoredGroups = [];
        })
      ),
    addIgnoredGroup: (group: string) =>
      set(
        produce((state: State) => {
          state.data.ignoredGroups.push(group);
        })
      ),
    removeIgnoredGroup: (group: string) =>
      set(
        produce((state: State) => {
          state.data.ignoredGroups = state.data.ignoredGroups.filter(g => g !== group);
        })
      ),
    setStatusMapping: (boardStatus, progressStatus) =>
      set(
        produce((state: State) => {
          if (progressStatus === 'unmapped') {
            delete state.data.statusMapping[boardStatus];
          } else {
            state.data.statusMapping[boardStatus] = progressStatus;
          }
        })
      ),
    setNewStatusMapping: (boardStatus, statusName, progressStatus) =>
      set(
        produce((state: State) => {
          if (progressStatus === 'unmapped') {
            delete state.data.newStatusMapping[boardStatus];
          } else {
            state.data.newStatusMapping[boardStatus] = {
              progressStatus,
              name: statusName,
            };
          }
        })
      ),
    changeCount: (countType, value) =>
      set(
        produce((state: State) => {
          state.data[countType] = value;
        })
      ),
  },
}));
