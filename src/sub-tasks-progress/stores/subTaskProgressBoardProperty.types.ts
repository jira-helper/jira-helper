import { AvailableColorSchemas } from '../colorSchemas';
import { BoardProperty, GroupFields, Status } from '../types';

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
    changeCount: (countType: 'subtasks' | 'epics' | 'linkedIssues', value: boolean) => void;
  };
};
