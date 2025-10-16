import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { setColumns } from './setColumns';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';

describe('setColumns', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  beforeEach(() => {
    // Reset to initial state before each test
    useAdditionalCardElementsBoardPropertyStore.setState(useAdditionalCardElementsBoardPropertyStore.getInitialState());
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should update columnsToTrack with enabled columns', () => {
    // ARRANGE
    const columns = [
      { name: 'Column 1', enabled: true },
      { name: 'Column 2', enabled: false },
      { name: 'Column 3', enabled: true },
    ];

    // ACT
    setColumns(columns);

    // ASSERT
    const { columnsToTrack } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(columnsToTrack).toEqual(['Column 1', 'Column 3']);
  });

  it('should set empty array if no columns are enabled', () => {
    // ARRANGE
    const columns = [
      { name: 'Column 1', enabled: false },
      { name: 'Column 2', enabled: false },
    ];

    // ACT
    setColumns(columns);

    // ASSERT
    const { columnsToTrack } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(columnsToTrack).toEqual([]);
  });

  it('should handle empty input array', () => {
    // ARRANGE
    const columns: { name: string; enabled: boolean }[] = [];

    // ACT
    setColumns(columns);

    // ASSERT
    const { columnsToTrack } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(columnsToTrack).toEqual([]);
  });
});
