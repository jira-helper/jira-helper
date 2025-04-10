import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { addIgnoredGroup } from './addIgnoredGroup';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

describe('addIgnoredGroup', () => {
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
      name: 'add new ignored group',
      initialGroups: [],
      groupToAdd: 'Group A',
      expectedGroups: ['Group A'],
      description: 'should add a new ignored group when none exist',
    },
    {
      name: 'add few ignored groups',
      initialGroups: ['Group A'],
      groupToAdd: 'Group B',
      expectedGroups: ['Group A', 'Group B'],
      description: 'should add a new ignored group to existing groups',
    },
    {
      name: 'add same ignored group twice',
      initialGroups: ['Group A'],
      groupToAdd: 'Group A',
      expectedGroups: ['Group A'],
      description: 'should not add duplicate ignored group',
    },
  ];

  // Run each test case
  testCases.forEach(({ name, initialGroups, groupToAdd, expectedGroups, description }) => {
    it(`${name} - ${description}`, () => {
      // ARRANGE - set initial ignored groups
      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          ignoredGroups: [...initialGroups],
        },
      }));

      // ACT - add the group
      addIgnoredGroup(groupToAdd);

      // ASSERT - verify the store state was updated correctly
      const { ignoredGroups } = useSubTaskProgressBoardPropertyStore.getState().data;

      // Check that the expected groups are present
      expect(ignoredGroups).toEqual(expectedGroups);

      // Check the length matches expected
      expect(ignoredGroups.length).toBe(expectedGroups.length);
    });
  });
});
