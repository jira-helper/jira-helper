import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { ToggleIgnoredStatus } from './toggleIgnoredStatus';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('ToggleIgnoredStatus', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should add status to ignoredStatuses when not present', () => {
    // ARRANGE
    const statusId = 123;
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        ignoredStatuses: [],
      },
    }));

    // ACT
    ToggleIgnoredStatus(statusId);

    // ASSERT
    expect(useSubTaskProgressBoardPropertyStore.getState().data.ignoredStatuses).toContain(statusId);
  });

  it('should remove status from ignoredStatuses when already present', () => {
    // ARRANGE
    const statusId = 123;
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        ignoredStatuses: [statusId],
      },
    }));

    // ACT
    ToggleIgnoredStatus(statusId);

    // ASSERT
    expect(useSubTaskProgressBoardPropertyStore.getState().data.ignoredStatuses).not.toContain(statusId);
  });

  it('should handle multiple statuses correctly', () => {
    // ARRANGE
    const statusId1 = 123;
    const statusId2 = 456;
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        ignoredStatuses: [statusId1],
      },
    }));

    // ACT - add a new status
    ToggleIgnoredStatus(statusId2);

    // ASSERT
    const { ignoredStatuses } = useSubTaskProgressBoardPropertyStore.getState().data;
    expect(ignoredStatuses).toContain(statusId1);
    expect(ignoredStatuses).toContain(statusId2);
    expect(ignoredStatuses.length).toBe(2);
  });
});
