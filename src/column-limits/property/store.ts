import { create } from 'zustand';
import { produce } from 'immer';
import type { WipLimitsProperty } from '../types';
import type { ColumnLimitsPropertyStoreState } from './interface';

const initialData: WipLimitsProperty = {};

export const useColumnLimitsPropertyStore = create<ColumnLimitsPropertyStoreState>()(set => ({
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

    reset: () => set({ data: {}, state: 'initial' }),
  },
}));

const getInitialData = (): WipLimitsProperty => ({});

useColumnLimitsPropertyStore.getInitialState = (): ColumnLimitsPropertyStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: useColumnLimitsPropertyStore.getState().actions,
});
