import { create } from 'zustand';
import { produce } from 'immer';
import type { PersonLimit, PersonWipLimitsProperty } from './types';
import type { PersonWipLimitsPropertyStoreState } from './interface';

const initialData: PersonWipLimitsProperty = {
  limits: [],
};

export const usePersonWipLimitsPropertyStore = create<PersonWipLimitsPropertyStoreState>()(set => ({
  data: initialData,
  state: 'initial',
  actions: {
    setData: data =>
      set(
        produce(state => {
          state.data = data;
        })
      ),

    setState: newState => set({ state: newState }),

    setLimits: limits =>
      set(
        produce(state => {
          state.data.limits = limits;
        })
      ),

    reset: () => set({ data: { ...initialData }, state: 'initial' }),
  },
}));

// For testing
const getInitialData = () => ({ ...initialData });
usePersonWipLimitsPropertyStore.getInitialState = (): PersonWipLimitsPropertyStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: usePersonWipLimitsPropertyStore.getState().actions,
});
