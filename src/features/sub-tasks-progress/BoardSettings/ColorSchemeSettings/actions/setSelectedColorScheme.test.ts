import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { setSelectedColorScheme } from './setSelectedColorScheme';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { AvailableColorSchemas } from '../../../colorSchemas';

describe('setSelectedColorScheme', () => {
  // Define test cases
  const testCases = [
    {
      initialState: 'jira',
      newValue: 'yellowGreen',
      description: 'should update from jira to yellowGreen',
    },
    {
      initialState: 'yellowGreen',
      newValue: 'jira',
      description: 'should update from yellowGreen to jira',
    },
    {
      initialState: 'jira',
      newValue: 'jira',
      description: 'should keep jira when jira is passed',
    },
  ];

  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  afterAll(() => {
    globalContainer.reset();
  });

  // Run each test case
  testCases.forEach(({ initialState, newValue, description }) => {
    it(description, () => {
      // ARRANGE
      // Set initial state
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          selectedColorScheme: initialState as AvailableColorSchemas,
        },
      }));

      // ACT - call the action we're testing
      setSelectedColorScheme(newValue as AvailableColorSchemas);

      // ASSERT - verify the store state was updated correctly
      expect(useSubTaskProgressBoardPropertyStore.getState().data.selectedColorScheme).toBe(newValue);
    });
  });
});
