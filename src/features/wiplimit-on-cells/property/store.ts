import { create } from 'zustand';
import { produce } from 'immer';
import type { WipLimitRange } from '../types';
import type { WipLimitCellsPropertyStoreState } from './types';

const initialData: WipLimitRange[] = [];

export const useWipLimitCellsPropertyStore = create<WipLimitCellsPropertyStoreState>()(set => ({
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

    reset: () => set({ data: [...initialData], state: 'initial' }),
  },
}));

// For testing
const getInitialData = () => [...initialData];
useWipLimitCellsPropertyStore.getInitialState = (): WipLimitCellsPropertyStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: useWipLimitCellsPropertyStore.getState().actions,
});
