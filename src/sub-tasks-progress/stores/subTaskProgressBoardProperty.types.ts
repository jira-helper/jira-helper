import { AvailableColorSchemas } from '../colorSchemas';
import { BoardProperty, GroupFields } from '../types';

export type State = {
  data: BoardProperty | undefined;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (data: BoardProperty) => void;
    setColumns: (columns: { name: string; enabled: boolean }[]) => void;
    setSelectedColorScheme: (colorScheme: AvailableColorSchemas) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    setGroupingField: (groupingField: GroupFields) => void;
  };
};
