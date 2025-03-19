import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { moveBoardStatusToProgressStatus } from './moveBoardStatusToProgressStatus';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('moveBoardStatusToProgressStatus', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  beforeEach(() => {
    useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should set a new status mapping', () => {
    // ARRANGE
    const boardStatus = 123;
    const statusName = 'In Progress';
    const progressStatus = 'inProgress';

    // Initialize with empty statusMapping
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        statusMapping: {},
      },
    }));

    // ACT
    moveBoardStatusToProgressStatus(boardStatus, statusName, progressStatus);

    // ASSERT
    const { newStatusMapping } = useSubTaskProgressBoardPropertyStore.getState().data;
    expect(newStatusMapping[boardStatus]).toEqual({
      name: statusName,
      progressStatus,
    });
  });

  it('should update an existing status mapping', () => {
    // ARRANGE
    const boardStatus = 123;
    const initialStatusName = 'In Progress';
    const initialProgressStatus = 'inProgress';
    const newStatusName = 'IN PROGRESS';
    const newProgressStatus = 'done';

    // Initialize with existing statusMapping
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        newStatusMapping: {
          [boardStatus]: { progressStatus: initialProgressStatus, name: initialStatusName },
        },
      },
    }));

    // ACT
    moveBoardStatusToProgressStatus(boardStatus, newStatusName, newProgressStatus);

    // ASSERT
    const { newStatusMapping } = useSubTaskProgressBoardPropertyStore.getState().data;

    expect(newStatusMapping[boardStatus]).toEqual({
      name: newStatusName,
      progressStatus: newProgressStatus,
    });
  });

  it('should handle multiple status mappings correctly', () => {
    // ARRANGE
    const boardStatus1 = 123;
    const statusName1 = 'In Progress';
    const progressStatus1 = 'inProgress';

    const boardStatus2 = 456;
    const statusName2 = 'Done';
    const progressStatus2 = 'done';

    // Initialize with empty statusMapping
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        statusMapping: {},
      },
    }));

    // ACT
    moveBoardStatusToProgressStatus(boardStatus1, statusName1, progressStatus1);
    moveBoardStatusToProgressStatus(boardStatus2, statusName2, progressStatus2);

    // ASSERT
    const { newStatusMapping } = useSubTaskProgressBoardPropertyStore.getState().data;
    expect(newStatusMapping[boardStatus1]).toEqual({
      name: statusName1,
      progressStatus: progressStatus1,
    });
    expect(newStatusMapping[boardStatus2]).toEqual({
      name: statusName2,
      progressStatus: progressStatus2,
    });
  });

  it('should remove mapping if new status in unmapped', () => {
    // ARRANGE
    const boardStatus = 123;
    const statusName = 'In Progress';
    const progressStatus = 'inProgress';

    // Initialize with existing statusMapping
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        newStatusMapping: {
          [boardStatus]: { progressStatus, name: statusName },
        },
      },
    }));

    // ACT
    moveBoardStatusToProgressStatus(boardStatus, 'Unmapped', 'unmapped');

    // ASSERT
    const { newStatusMapping } = useSubTaskProgressBoardPropertyStore.getState().data;
    expect(newStatusMapping[boardStatus]).toBeUndefined();
  });
});
