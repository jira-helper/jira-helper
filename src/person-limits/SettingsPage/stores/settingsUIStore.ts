import { create } from 'zustand';
import { produce } from 'immer';
import type { SettingsUIData, SettingsUIStoreState } from './settingsUIStore.types';

const initialData: SettingsUIData = {
  limits: [],
  checkedIds: [],
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
          state.data.checkedIds = state.data.checkedIds.filter((c: number) => c !== id);
          if (state.data.editingId === id) {
            state.data.editingId = null;
            state.data.formData = null;
          }
        })
      ),

    setCheckedIds: (ids: number[]) =>
      set(
        produce(state => {
          state.data.checkedIds = ids;
        })
      ),

    toggleChecked: (id: number) =>
      set(
        produce(state => {
          const index = state.data.checkedIds.indexOf(id);
          if (index === -1) {
            state.data.checkedIds.push(id);
          } else {
            state.data.checkedIds.splice(index, 1);
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
                personName: limit.person.name,
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

    applyColumnsToSelected: (columns: Array<{ id: string; name: string }>) =>
      set(
        produce(state => {
          state.data.limits.forEach((limit: import('../../property/types').PersonLimit) => {
            if (state.data.checkedIds.includes(limit.id)) {
              limit.columns = columns;
            }
          });
        })
      ),

    applySwimlanesToSelected: (swimlanes: Array<{ id: string; name: string }>) =>
      set(
        produce(state => {
          state.data.limits.forEach((limit: import('../../property/types').PersonLimit) => {
            if (state.data.checkedIds.includes(limit.id)) {
              limit.swimlanes = swimlanes;
            }
          });
        })
      ),

    reset: () => set({ data: { ...initialData }, state: 'initial' }),
  },
}));

const getInitialData = (): SettingsUIData => ({
  limits: [],
  checkedIds: [],
  editingId: null,
  formData: null,
});

useSettingsUIStore.getInitialState = (): SettingsUIStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: useSettingsUIStore.getState().actions,
});
