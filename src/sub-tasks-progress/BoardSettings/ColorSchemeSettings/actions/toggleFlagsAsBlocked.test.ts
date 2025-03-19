import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { toggleFlagsAsBlocked } from './toggleFlagsAsBlocked';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('toggleFlagsAsBlocked', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should toggle flagsAsBlocked from false to true', () => {
    // ARRANGE
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        flagsAsBlocked: false,
      },
    }));

    // ACT
    toggleFlagsAsBlocked();

    // ASSERT
    expect(useSubTaskProgressBoardPropertyStore.getState().data.flagsAsBlocked).toBe(true);
  });

  it('should toggle flagsAsBlocked from true to false', () => {
    // ARRANGE
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        flagsAsBlocked: true,
      },
    }));

    // ACT
    toggleFlagsAsBlocked();

    // ASSERT
    expect(useSubTaskProgressBoardPropertyStore.getState().data.flagsAsBlocked).toBe(false);
  });
});
