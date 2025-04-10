import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { toggleBlockedByLinksAsBlocked } from './toggleBlockedByLinksAsBlocked';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('toggleBlockedByLinksAsBlocked', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should toggle blockedByLinksAsBlocked from false to true', () => {
    // ARRANGE
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        blockedByLinksAsBlocked: false,
      },
    }));

    // ACT
    toggleBlockedByLinksAsBlocked();

    // ASSERT
    expect(useSubTaskProgressBoardPropertyStore.getState().data.blockedByLinksAsBlocked).toBe(true);
  });

  it('should toggle blockedByLinksAsBlocked from true to false', () => {
    // ARRANGE
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        blockedByLinksAsBlocked: true,
      },
    }));

    // ACT
    toggleBlockedByLinksAsBlocked();

    // ASSERT
    expect(useSubTaskProgressBoardPropertyStore.getState().data.blockedByLinksAsBlocked).toBe(false);
  });
});
