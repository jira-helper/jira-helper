import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { setSubtasksProgressDisplayMode } from './setSubtasksProgressDisplayMode';

describe('setSubtasksProgressDisplayMode', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });
  afterAll(() => {
    globalContainer.reset();
  });
  const testCases = [
    { initialState: 'splitLines', newValue: 'singleLine', description: 'should update from splitLines to singleLine' },
    { initialState: 'singleLine', newValue: 'splitLines', description: 'should update from singleLine to splitLines' },
  ] as const;
  testCases.forEach(({ initialState: initialValue, newValue, description }) => {
    it(description, () => {
      // ARRANGE
      // Set initial state
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          subtasksProgressDisplayMode: initialValue,
        },
      }));

      // ACT
      setSubtasksProgressDisplayMode(newValue);

      // ASSERT
      expect(useSubTaskProgressBoardPropertyStore.getState().data.subtasksProgressDisplayMode).toBe(newValue);
    });
  });
});
