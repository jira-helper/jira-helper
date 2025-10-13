import { CustomGroup } from '../../BoardSettings/GroupingSettings/CustomGroups/types';

import { BoardProperty, CountType, GroupFields, IssueLinkTypeSelection } from '../../types';

export type State = {
  data: Required<BoardProperty>;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (data: BoardProperty) => void;
    setColumns: (columns: { name: string; enabled: boolean }[]) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    setGroupingField: (groupingField: GroupFields) => void;
    changeCount: (countType: CountType, value: boolean) => void;
    addIgnoredGroup: (group: string) => void;
    removeIgnoredGroup: (group: string) => void;
    toggleEnabled: (value?: boolean) => void;
    toggleFlagsAsBlocked: () => void;
    toggleBlockedByLinksAsBlocked: () => void;
    setSubtasksProgressDisplayMode: (displayMode: 'splitLines' | 'singleLine') => void;
    addCustomGroup: () => void;
    updateCustomGroup: <Key extends keyof CustomGroup>(id: number, key: Key, value: CustomGroup[Key]) => void;
    removeCustomGroup: (id: number) => void;
    setCustomGroups: (groups: CustomGroup[]) => void;
    setEnableAllTasksTracking: (enabled: boolean) => void;
    setEnableGroupByField: (enabled: boolean) => void;
    setShowGroupsByFieldAsCounters: (showAsCounters: boolean) => void;
    setGroupByFieldPendingColor: (color: string) => void;
    setGroupByFieldDoneColor: (color: string) => void;
    setGroupByFieldHideIfCompleted: (hideIfCompleted: boolean) => void;
    setGroupByFieldShowOnlyIncomplete: (showOnlyIncomplete: boolean) => void;
    setIssueLinkTypesToCount: (selections: IssueLinkTypeSelection[]) => void;
    clearIssueLinkTypesToCount: () => void;
  };
};
