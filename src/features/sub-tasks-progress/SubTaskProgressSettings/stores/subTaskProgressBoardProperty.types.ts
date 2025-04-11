import { AvailableColorSchemas } from '../../colorSchemas';
import { BoardProperty, CountType, GroupFields, Status } from '../../types';

export type State = {
  data: Required<BoardProperty>;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (data: BoardProperty) => void;
    setColumns: (columns: { name: string; enabled: boolean }[]) => void;
    setSelectedColorScheme: (colorScheme: AvailableColorSchemas) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    setGroupingField: (groupingField: GroupFields) => void;
    setStatusMapping: (boardStatus: string, progressStatus: Status) => void;
    setNewStatusMapping: (boardStatus: number, statusName: string, progressStatus: Status) => void;
    changeCount: (countType: CountType, value: boolean) => void;
    addIgnoredGroup: (group: string) => void;
    removeIgnoredGroup: (group: string) => void;
    setUseCustomColorScheme: (useCustomColorScheme: boolean) => void;
    toggleEnabled: (value?: boolean) => void;
    toggleIgnoredStatus: (statusId: number) => void;
    toggleFlagsAsBlocked: () => void;
    toggleBlockedByLinksAsBlocked: () => void;
  };
};
