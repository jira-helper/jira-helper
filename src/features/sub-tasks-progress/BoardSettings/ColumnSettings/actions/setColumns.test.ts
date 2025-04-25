import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { setColumns } from './setColumns';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('setColumns', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  beforeEach(() => {
    // Reset to initial state before each test
    useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should update columns in the store', () => {
    // ARRANGE
    const initialColumns = [
      { name: 'Column 1', enabled: true },
      { name: 'Column 2', enabled: false },
    ];

    // Set initial columns
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        columns: initialColumns,
      },
    }));

    // New columns to set
    const newColumns = [
      { name: 'Column 1', enabled: false },
      { name: 'Column 2', enabled: true },
      { name: 'Column 3', enabled: true },
    ];

    // ACT
    setColumns(newColumns);

    // ASSERT
    const { columnsToTrack } = useSubTaskProgressBoardPropertyStore.getState().data;
    expect(columnsToTrack).toEqual(['Column 2', 'Column 3']);
  });
});
