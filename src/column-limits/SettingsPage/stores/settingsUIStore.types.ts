import type { Column, UIGroup, IssueTypeState } from '../../types';

export type SettingsUIData = {
  /** Колонки без группы (зона "Without Group") */
  withoutGroupColumns: Column[];
  /** Группы колонок с лимитами и настройками */
  groups: UIGroup[];
  /** Состояние селектора типов задач по groupId */
  issueTypeSelectorStates: Record<string, IssueTypeState>;
};

export interface SettingsUIStoreState {
  data: SettingsUIData;
  state: 'initial' | 'loaded';
  actions: {
    setData: (data: Pick<SettingsUIData, 'withoutGroupColumns' | 'groups'>) => void;
    setWithoutGroupColumns: (columns: Column[]) => void;
    setGroups: (groups: UIGroup[]) => void;
    setGroupLimit: (groupId: string, limit: number) => void;
    setGroupColor: (groupId: string, customHexColor: string) => void;
    setIssueTypeState: (groupId: string, state: IssueTypeState) => void;
    moveColumn: (column: Column, fromGroupId: string, toGroupId: string) => void;
    setState: (state: 'initial' | 'loaded') => void;
    reset: () => void;
  };
}
