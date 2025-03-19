import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { changeUseCustomColorScheme } from './changeUseCustomColorScheme';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('changeUseCustomColorScheme', () => {
  // Define test cases
  const testCases = [
    { initialState: false, newValue: true, description: 'should update from false to true' },
    { initialState: true, newValue: false, description: 'should update from true to false' },
    { initialState: false, newValue: false, description: 'should keep false when false is passed' },
    { initialState: true, newValue: true, description: 'should keep true when true is passed' },
  ];
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });
  afterAll(() => {
    globalContainer.reset();
  });

  // Run each test case
  testCases.forEach(({ initialState: initialValue, newValue, description }) => {
    it(description, () => {
      // ARRANGE
      // Set initial state
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          useCustomColorScheme: initialValue,
        },
      }));

      // ACT - call the action we're testing
      changeUseCustomColorScheme(newValue);

      // ASSERT - verify the store state was updated correctly
      expect(useSubTaskProgressBoardPropertyStore.getState().data.useCustomColorScheme).toBe(newValue);
    });
  });
});
