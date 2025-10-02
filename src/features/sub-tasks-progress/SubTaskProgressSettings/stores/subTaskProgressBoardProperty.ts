import { create } from 'zustand';
import { produce } from 'immer';
import { State } from './subTaskProgressBoardProperty.types';
import { BoardProperty } from '../../types';
import { CustomGroup } from '../../BoardSettings/GroupingSettings/CustomGroups/types';

const initialData: Required<BoardProperty> = {
  enabled: true,
  columnsToTrack: [],
  selectedColorScheme: 'jira',
  statusMapping: {},
  newStatusMapping: {},
  countEpicIssues: false,
  countEpicLinkedIssues: false,
  countEpicExternalLinks: false,
  countIssuesSubtasks: false,
  countIssuesLinkedIssues: false,
  countIssuesExternalLinks: false,
  countSubtasksLinkedIssues: false,
  countSubtasksExternalLinks: false,
  useCustomColorScheme: false,
  ignoredGroups: [],
  groupingField: 'project',
  ignoredStatuses: [],
  flagsAsBlocked: true,
  blockedByLinksAsBlocked: false,
  subtasksProgressDisplayMode: 'splitLines',
  customGroups: [],
  enableAllTasksTracking: true,
  enableGroupByField: true,
  showGroupsByFieldAsCounters: false,
  groupByFieldHideIfCompleted: false,
  groupByFieldShowOnlyIncomplete: false,
  groupByFieldPendingColor: '#3b82f6',
  groupByFieldDoneColor: '#22c55e',
  issueLinkTypesToCount: [],
};

export const useSubTaskProgressBoardPropertyStore = create<State>()(set => ({
  data: initialData,
  state: 'initial',
  actions: {
    toggleEnabled: value =>
      set(
        produce((state: State) => {
          if (value === undefined) {
            state.data.enabled = !state.data.enabled;
          } else {
            state.data.enabled = value;
          }
        })
      ),
    setData: data => {
      // check new option by data of old options
      if (data.enableAllTasksTracking === undefined && data.enableGroupByField === true) {
        data.enableAllTasksTracking = true;
      }
      return set({ data: { ...initialData, ...data } });
    },
    setColumns: columns =>
      set(
        produce((state: State) => {
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
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
          if (!state.data.ignoredGroups.includes(group)) {
            state.data.ignoredGroups.push(group);
          }
        })
      ),
    removeIgnoredGroup: (group: string) =>
      set(
        produce((state: State) => {
          state.data.ignoredGroups = state.data.ignoredGroups.filter(g => g !== group);
        })
      ),
    changeCount: (countType, value) =>
      set(
        produce((state: State) => {
          state.data[countType] = value;
        })
      ),

    toggleFlagsAsBlocked: () =>
      set(
        produce((state: State) => {
          state.data.flagsAsBlocked = !state.data.flagsAsBlocked;
        })
      ),
    toggleBlockedByLinksAsBlocked: () =>
      set(
        produce((state: State) => {
          state.data.blockedByLinksAsBlocked = !state.data.blockedByLinksAsBlocked;
        })
      ),
    setSubtasksProgressDisplayMode: (displayMode: 'splitLines' | 'singleLine') =>
      set(
        produce((state: State) => {
          state.data.subtasksProgressDisplayMode = displayMode;
        })
      ),
    addCustomGroup: () =>
      set(
        produce((state: State) => {
          state.data.customGroups.push({
            id: Date.now(),
            name: '',
            description: '',
            mode: 'field',
            fieldId: '',
            value: '',
            jql: '',
            showAsCounter: false,
            badgeDoneColor: '#22c55e',
            badgePendingColor: '#3b82f6',
            hideCompleted: false,
            showOnlyIncomplete: false,
          });
        })
      ),
    updateCustomGroup: <Key extends keyof CustomGroup>(id: number, key: Key, value: CustomGroup[Key]) =>
      set(
        produce((state: State) => {
          const group = state.data.customGroups.find(g => g.id === id);
          if (group) {
            group[key] = value;
          }
        })
      ),
    removeCustomGroup: (id: number) =>
      set(
        produce((state: State) => {
          state.data.customGroups = state.data.customGroups.filter(g => g.id !== id);
        })
      ),
    setCustomGroups: (groups: typeof initialData.customGroups) =>
      set(
        produce((state: State) => {
          state.data.customGroups = groups;
        })
      ),
    setEnableAllTasksTracking: (enabled: boolean) =>
      set(
        produce((state: State) => {
          state.data.enableAllTasksTracking = enabled;
        })
      ),
    setEnableGroupByField: (enabled: boolean) =>
      set(
        produce((state: State) => {
          state.data.enableGroupByField = enabled;
        })
      ),
    setShowGroupsByFieldAsCounters: (showAsCounters: boolean) =>
      set(
        produce((state: State) => {
          state.data.showGroupsByFieldAsCounters = showAsCounters;
        })
      ),
    setGroupByFieldPendingColor: (color: string) =>
      set(
        produce((state: State) => {
          state.data.groupByFieldPendingColor = color;
        })
      ),
    setGroupByFieldDoneColor: (color: string) =>
      set(
        produce((state: State) => {
          state.data.groupByFieldDoneColor = color;
        })
      ),
    setGroupByFieldHideIfCompleted: (hideIfCompleted: boolean) =>
      set(
        produce((state: State) => {
          state.data.groupByFieldHideIfCompleted = hideIfCompleted;
        })
      ),
    setGroupByFieldShowOnlyIncomplete: (showOnlyIncomplete: boolean) =>
      set(
        produce((state: State) => {
          state.data.groupByFieldShowOnlyIncomplete = showOnlyIncomplete;
        })
      ),
    setIssueLinkTypesToCount: selections =>
      set(
        produce((state: State) => {
          state.data.issueLinkTypesToCount = selections;
        })
      ),
    clearIssueLinkTypesToCount: () =>
      set(
        produce((state: State) => {
          state.data.issueLinkTypesToCount = [];
        })
      ),
  },
}));
