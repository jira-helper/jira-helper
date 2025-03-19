import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { removeIgnoredGroup } from './removeIgnoredGroup';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('removeIgnoredGroup', () => {
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

  // Define test cases
  const testCases = [
    {
      name: 'remove one of two groups',
      initialGroups: ['Group A', 'Group B'],
      groupToRemove: 'Group A',
      expectedGroups: ['Group B'],
      description: 'should remove one group and leave the other',
    },
    {
      name: 'attempt to remove non-existent group',
      initialGroups: ['Group A', 'Group B'],
      groupToRemove: 'Group C',
      expectedGroups: ['Group A', 'Group B'],
      description: 'should not change groups when removing non-existent group',
    },
    {
      name: 'remove from empty list',
      initialGroups: [],
      groupToRemove: 'Group A',
      expectedGroups: [],
      description: 'should handle removing from empty list without errors',
    },
  ];

  // Run each test case
  testCases.forEach(({ name, initialGroups, groupToRemove, expectedGroups, description }) => {
    it(`${name} - ${description}`, () => {
      // ARRANGE - set initial ignored groups
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          ignoredGroups: [...initialGroups],
        },
      }));

      // ACT - remove the group
      removeIgnoredGroup(groupToRemove);

      // ASSERT - verify the store state was updated correctly
      const { ignoredGroups } = useSubTaskProgressBoardPropertyStore.getState().data;

      // Check that the expected groups are present
      expect(ignoredGroups).toEqual(expectedGroups);

      // Check the length matches expected
      expect(ignoredGroups.length).toBe(expectedGroups.length);
    });
  });
});
