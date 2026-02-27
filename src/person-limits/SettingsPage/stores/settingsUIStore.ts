import { create } from 'zustand';
import { produce } from 'immer';
import type { SettingsUIData, SettingsUIStoreState } from './settingsUIStore.types';

const initialData: SettingsUIData = {
  limits: [],
  editingId: null,
  formData: null,
};

export const useSettingsUIStore = create<SettingsUIStoreState>()(set => ({
  data: initialData,
  state: 'initial',
  actions: {
    setData: limits =>
      set(
        produce(state => {
          state.data.limits = limits;
          state.state = 'loaded';
        })
      ),

    setLimits: limits =>
      set(
        produce(state => {
          state.data.limits = limits;
        })
      ),

    setState: newState => set({ state: newState }),

    addLimit: limit =>
      set(
        produce(state => {
          state.data.limits.push(limit);
          state.data.formData = null;
        })
      ),

    updateLimit: (id: number, updatedLimit: import('../../property/types').PersonLimit) =>
      set(
        produce(state => {
          const index = state.data.limits.findIndex((l: import('../../property/types').PersonLimit) => l.id === id);
          if (index !== -1) {
            state.data.limits[index] = updatedLimit;
          }
          state.data.editingId = null;
          state.data.formData = null;
        })
      ),

    deleteLimit: (id: number) =>
      set(
        produce(state => {
          state.data.limits = state.data.limits.filter((l: import('../../property/types').PersonLimit) => l.id !== id);
          if (state.data.editingId === id) {
            state.data.editingId = null;
            state.data.formData = null;
          }
        })
      ),

    setEditingId: (id: number | null) =>
      set(
        produce(state => {
          state.data.editingId = id;
          if (id !== null) {
            const limit = state.data.limits.find((l: import('../../property/types').PersonLimit) => l.id === id);
            if (limit) {
              const selectedColumns =
                limit.columns.length === 0 ? [] : limit.columns.map((c: { id: string | number }) => String(c.id));
              const swimlanes =
                limit.swimlanes.length === 0
                  ? []
                  : limit.swimlanes.map((s: { id?: string; name: string }) => String(s.id ?? s.name));
              state.data.formData = {
                person: {
                  name: limit.person.name,
                  displayName: limit.person.displayName || limit.person.name,
                  avatar: limit.person.avatar,
                  self: limit.person.self,
                },
                limit: limit.limit,
                selectedColumns,
                swimlanes,
                includedIssueTypes: limit.includedIssueTypes,
              };
            }
          } else {
            state.data.formData = null;
          }
        })
      ),

    setFormData: (formData: import('./settingsUIStore.types').FormData | null) =>
      set(
        produce(state => {
          state.data.formData = formData;
        })
      ),

    isDuplicate: (personName: string, columns: string[], swimlanes: string[], issueTypes?: string[]): boolean => {
      const { limits } = useSettingsUIStore.getState().data;
      return limits.some(l => {
        const nameMatch = l.person.name === personName;

        const existingColIds = l.columns.map(c => c.id).sort();
        const newColIds = [...columns].sort();
        const colMatch =
          existingColIds.length === newColIds.length && existingColIds.every((id, i) => id === newColIds[i]);

        const existingSwimIds = l.swimlanes.map(s => s.id).sort();
        const newSwimIds = [...swimlanes].sort();
        const swimMatch =
          existingSwimIds.length === newSwimIds.length && existingSwimIds.every((id, i) => id === newSwimIds[i]);

        const existingTypes = [...(l.includedIssueTypes || [])].sort();
        const newTypes = [...(issueTypes || [])].sort();
        const typeMatch = existingTypes.length === newTypes.length && existingTypes.every((t, i) => t === newTypes[i]);
        return nameMatch && colMatch && swimMatch && typeMatch;
      });
    },

    reset: () => set({ data: { ...initialData }, state: 'initial' }),
  },
}));

const getInitialData = (): SettingsUIData => ({
  limits: [],
  editingId: null,
  formData: null,
});

useSettingsUIStore.getInitialState = (): SettingsUIStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: useSettingsUIStore.getState().actions,
});
