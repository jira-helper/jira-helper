import { create } from 'zustand';
import { produce } from 'immer';
import type { PersonLimit } from '../../property/types';
import type { FormData, SettingsUIData, SettingsUIStoreState } from './settingsUIStore.types';

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

    updateLimit: (id, updatedLimit) =>
      set(
        produce(state => {
          const index = state.data.limits.findIndex(l => l.id === id);
          if (index !== -1) {
            state.data.limits[index] = updatedLimit;
          }
          state.data.editingId = null;
          state.data.formData = null;
        })
      ),

    deleteLimit: id =>
      set(
        produce(state => {
          state.data.limits = state.data.limits.filter(l => l.id !== id);
          state.data.checkedIds = state.data.checkedIds.filter(c => c !== id);
          if (state.data.editingId === id) {
            state.data.editingId = null;
            state.data.formData = null;
          }
        })
      ),

    setCheckedIds: ids =>
      set(
        produce(state => {
          state.data.checkedIds = ids;
        })
      ),

    toggleChecked: id =>
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

    setEditingId: id =>
      set(
        produce(state => {
          state.data.editingId = id;
          if (id !== null) {
            const limit = state.data.limits.find(l => l.id === id);
            if (limit) {
              const selectedColumns = limit.columns.length === 0 ? [] : limit.columns.map(c => String(c.id));
              const swimlanes = limit.swimlanes.length === 0 ? [] : limit.swimlanes.map(s => String(s.id ?? s.name));
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

    setFormData: formData =>
      set(
        produce(state => {
          state.data.formData = formData;
        })
      ),

    applyColumnsToSelected: columns =>
      set(
        produce(state => {
          state.data.limits.forEach(limit => {
            if (state.data.checkedIds.includes(limit.id)) {
              limit.columns = columns;
            }
          });
        })
      ),

    applySwimlanesToSelected: swimlanes =>
      set(
        produce(state => {
          state.data.limits.forEach(limit => {
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
