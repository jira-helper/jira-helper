import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { changeCount } from './changeCount';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { CountType } from '../../../types';

describe('changeCount', () => {
  // Define test cases for different count types
  const countTypes: CountType[] = [
    'countEpicIssues',
    'countEpicLinkedIssues',
    'countEpicExternalLinks',
    'countIssuesSubtasks',
    'countIssuesLinkedIssues',
    'countIssuesExternalLinks',
    'countSubtasksLinkedIssues',
    'countSubtasksExternalLinks',
  ];

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

  // Test enabling each count type
  countTypes.forEach(countType => {
    it(`should enable ${countType}`, () => {
      // ARRANGE - ensure the count type is initially false
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          [countType]: false,
        },
      }));

      // ACT
      changeCount(countType, true);

      // ASSERT
      expect(useSubTaskProgressBoardPropertyStore.getState().data[countType]).toBe(true);
    });
  });

  // Test disabling each count type
  countTypes.forEach(countType => {
    it(`should disable ${countType}`, () => {
      // ARRANGE - set the count type to true initially
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          [countType]: true,
        },
      }));

      // ACT
      changeCount(countType, false);

      // ASSERT
      expect(useSubTaskProgressBoardPropertyStore.getState().data[countType]).toBe(false);
    });
  });

  // Test that other count types remain unchanged
  it('should only change the specified count type', () => {
    // ARRANGE - set all count types to false
    const initialState = useSubTaskProgressBoardPropertyStore.getInitialState();
    countTypes.forEach(type => {
      initialState.data[type] = false;
    });
    useSubTaskProgressBoardPropertyStore.setState(initialState);

    // Choose one count type to change
    const countTypeToChange = countTypes[0];

    // ACT - change only one count type
    changeCount(countTypeToChange, true);

    // ASSERT
    const currentState = useSubTaskProgressBoardPropertyStore.getState().data;

    // The changed count type should be true
    expect(currentState[countTypeToChange]).toBe(true);

    // All other count types should still be false
    countTypes
      .filter(type => type !== countTypeToChange)
      .forEach(type => {
        expect(currentState[type]).toBe(false);
      });
  });
});
