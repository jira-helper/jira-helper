import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { resetBoardProperty } from './resetBoardProperty';
import { useSubTaskProgressBoardPropertyStore } from '../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('resetBoardProperty', () => {
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

  it('should reset all properties to initial state', () => {
    // ARRANGE - modify multiple properties
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      state: 'loaded',
      data: {
        ...state.data,
        useCustomColorScheme: true,
        flagsAsBlocked: true,
        blockedByLinksAsBlocked: true,
        selectedColorScheme: 'yellowGreen',
        ignoredStatuses: [123, 456],
        newStatusMapping: {
          789: { name: 'In Progress', progressStatus: 'inProgress' },
        },
      },
    }));

    // ACT
    resetBoardProperty();

    // ASSERT
    const resetedState = useSubTaskProgressBoardPropertyStore.getState();

    // data should be reset
    expect(resetedState.data).toStrictEqual(useSubTaskProgressBoardPropertyStore.getInitialState().data);
    // state should NOT be reset
    expect(resetedState.state).toBe('loaded');
  });
});
