import { create } from 'zustand';
import { produce } from 'immer';
import { State } from './subTaskProgressBoardProperty.types';

export const useSubTaskProgressBoardPropertyStore = create<State>()(set => ({
  data: undefined,
  state: 'initial',
  actions: {
    setData: data => set({ data }),
    setColumns: columns =>
      set(
        produce((state: State) => {
          if (!state.data) return;
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
        })
      ),
    setSelectedColorScheme: colorScheme =>
      set(
        produce((state: State) => {
          if (!state.data) return;
          state.data.selectedColorScheme = colorScheme;
        })
      ),
    setState: state => set({ state }),
  },
}));
