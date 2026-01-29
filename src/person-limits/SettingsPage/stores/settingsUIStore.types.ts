import type { PersonLimit } from '../../property/types';

export type FormData = {
  personName: string;
  limit: number;
  selectedColumns: string[];
  swimlanes: string[];
  includedIssueTypes?: string[];
};

export type SettingsUIData = {
  limits: PersonLimit[];
  checkedIds: number[];
  editingId: number | null;
  formData: FormData | null;
};

export interface SettingsUIStoreState {
  data: SettingsUIData;
  state: 'initial' | 'loading' | 'loaded';
  actions: {
    setData: (limits: PersonLimit[]) => void;
    setLimits: (limits: PersonLimit[]) => void;
    setState: (state: 'initial' | 'loading' | 'loaded') => void;
    addLimit: (limit: PersonLimit) => void;
    updateLimit: (id: number, limit: PersonLimit) => void;
    deleteLimit: (id: number) => void;
    setCheckedIds: (ids: number[]) => void;
    toggleChecked: (id: number) => void;
    setEditingId: (id: number | null) => void;
    setFormData: (formData: FormData | null) => void;
    applyColumnsToSelected: (columns: Array<{ id: string; name: string }>) => void;
    applySwimlanesToSelected: (swimlanes: Array<{ id: string; name: string }>) => void;
    reset: () => void;
  };
}
