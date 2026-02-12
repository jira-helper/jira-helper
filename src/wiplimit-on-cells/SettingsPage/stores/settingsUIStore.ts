import { create } from 'zustand';
import { produce } from 'immer';
import type { SettingsUIStoreState } from './types';

const initialData: SettingsUIStoreState['data'] = {
  ranges: [],
  swimlanes: [],
  columns: [],
};

export const useWipLimitCellsSettingsUIStore = create<SettingsUIStoreState>()(set => ({
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
          const searchDouble = state.data.ranges.filter(element => element.name === name);
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
          state.data.ranges = state.data.ranges.filter(elem => elem.name !== name);
        })
      ),

    addCells: (rangeName, cell) =>
      set(
        produce(state => {
          const searchDouble = state.data.ranges.filter(
            element => element.name.toLowerCase() === rangeName.toLowerCase()
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
          state.data.ranges.forEach(range => {
            if (range.name === rangeName) {
              range.cells = range.cells.filter(
                elem => !(String(elem.swimlane) === swimlaneStr && String(elem.column) === columnStr)
              );
            }
          });
        })
      ),

    changeField: (name, field, value) =>
      set(
        produce(state => {
          for (const range of state.data.ranges) {
            if (range.name === name) {
              // @ts-expect-error dynamic field assignment
              range[field] = value;
            }
          }
        })
      ),

    findRange: name => {
      const state = useWipLimitCellsSettingsUIStore.getState();
      const searchDouble = state.data.ranges.filter(element => element.name.toLowerCase() === name.toLowerCase());
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
