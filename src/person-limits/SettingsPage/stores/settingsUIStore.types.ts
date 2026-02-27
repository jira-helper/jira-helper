import type { PersonLimit } from '../../property/types';

export type SelectedPerson = {
  name: string;
  displayName: string;
  avatar: string;
  self: string;
};

export type FormData = {
  person: SelectedPerson | null;
  limit: number;
  selectedColumns: string[];
  swimlanes: string[];
  includedIssueTypes?: string[];
};

export type SettingsUIData = {
  limits: PersonLimit[];
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
    setEditingId: (id: number | null) => void;
    setFormData: (formData: FormData | null) => void;
    isDuplicate: (personName: string, columns: string[], swimlanes: string[], issueTypes?: string[]) => boolean;
    reset: () => void;
  };
}
