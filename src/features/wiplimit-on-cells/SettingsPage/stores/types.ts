import type { WipLimitRange, WipLimitCell } from '../../types';

/**
 * Swimlane - дорожка на доске Jira.
 */
export interface Swimlane {
  id: string;
  name: string;
}

/**
 * Column - колонка на доске Jira.
 */
export interface Column {
  id: string;
  name: string;
  isKanPlanColumn?: boolean;
}

/**
 * SettingsUIStoreState - состояние UI Store для Settings Page.
 * Управляет данными диапазонов, swimlanes, columns и их редактированием.
 */
export interface SettingsUIStoreState {
  data: {
    ranges: WipLimitRange[];
    swimlanes: Swimlane[];
    columns: Column[];
  };
  state: 'initial' | 'loaded';
  actions: {
    setRanges: (ranges: WipLimitRange[]) => void;
    setSwimlanes: (swimlanes: Swimlane[]) => void;
    setColumns: (columns: Column[]) => void;
    addRange: (name: string) => boolean; // returns false if validation fails
    deleteRange: (name: string) => void;
    addCells: (rangeName: string, cell: WipLimitCell) => void;
    deleteCells: (rangeName: string, swimlane: string, column: string) => void;
    changeField: (name: string, field: string, value: any) => void;
    findRange: (name: string) => boolean;
    reset: () => void;
  };
}
