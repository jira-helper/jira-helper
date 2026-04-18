import { create } from 'zustand';
import { produce } from 'immer';
import type { WipLimitRange, WipLimitCell } from '../../types';
import type { SettingsUIStoreState } from './types';

const initialData: SettingsUIStoreState['data'] = {
  ranges: [],
  swimlanes: [],
  columns: [],
};

export const useWipLimitCellsSettingsUIStore = create<SettingsUIStoreState>()((set, get) => ({
  data: initialData,
  state: 'initial',
  actions: {
    setRanges: ranges =>
      set(
        produce(state => {
          state.data.ranges = ranges;
          state.state = 'loaded';
        })
      ),

    setSwimlanes: swimlanes =>
      set(
        produce(state => {
          state.data.swimlanes = swimlanes;
        })
      ),

    setColumns: columns =>
      set(
        produce(state => {
          state.data.columns = columns;
        })
      ),

    addRange: name => {
      if (name === '') {
        return false;
      }

      let added = false;
      set(
        produce(state => {
          const searchDouble = state.data.ranges.filter((element: WipLimitRange) => element.name === name);
          if (searchDouble.length > 0) {
            return;
          }

          state.data.ranges.push({
            name,
            wipLimit: 0,
            cells: [],
          });
          added = true;
        })
      );

      return added;
    },

    deleteRange: name =>
      set(
        produce(state => {
          state.data.ranges = state.data.ranges.filter((elem: WipLimitRange) => elem.name !== name);
        })
      ),

    addCells: (rangeName, cell) =>
      set(
        produce(state => {
          const searchDouble = state.data.ranges.filter(
            (element: WipLimitRange) => element.name.toLowerCase() === rangeName.toLowerCase()
          );
          if (searchDouble.length !== 1) {
            return;
          }

          const range = searchDouble[0];
          let unique = true;
          for (const cellData of range.cells) {
            if (cell.swimlane === cellData.swimlane && cell.column === cellData.column) {
              unique = false;
              break;
            }
          }

          if (unique) {
            range.cells.push({ ...cell });
          }
        })
      ),

    deleteCells: (rangeName, swimlane, column) =>
      set(
        produce(state => {
          const swimlaneStr = String(swimlane);
          const columnStr = String(column);
          state.data.ranges.forEach((range: WipLimitRange) => {
            if (range.name === rangeName) {
              range.cells = range.cells.filter(
                (elem: WipLimitCell) => !(String(elem.swimlane) === swimlaneStr && String(elem.column) === columnStr)
              );
            }
          });
        })
      ),

    changeField: (name, field, value) =>
      set(
        produce(state => {
          for (const range of state.data.ranges as WipLimitRange[]) {
            if (range.name === name) {
              (range as Record<string, unknown>)[field] = value;
            }
          }
        })
      ),

    findRange: (name: string): boolean => {
      const state = get();
      const searchDouble = state.data.ranges.filter(
        (element: WipLimitRange) => element.name.toLowerCase() === name.toLowerCase()
      );
      return searchDouble.length > 0;
    },

    reset: () => set({ data: { ...initialData }, state: 'initial' }),
  },
}));

const getInitialData = (): SettingsUIStoreState['data'] => ({
  ranges: [],
  swimlanes: [],
  columns: [],
});

useWipLimitCellsSettingsUIStore.getInitialState = (): SettingsUIStoreState => ({
  data: getInitialData(),
  state: 'initial',
  actions: useWipLimitCellsSettingsUIStore.getState().actions,
});
