import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { setGroupingField } from './setGroupingField';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { GroupFields } from '../../../types';

describe('setGroupingField', () => {
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

  it('should change grouping field and clear ignored groups', () => {
    // ARRANGE - set initial grouping field and ignored groups
    const initialGroupingField: GroupFields = 'project';
    const newGroupingField: GroupFields = 'assignee';
    const ignoredGroups = ['Group A', 'Group B'];

    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        groupingField: initialGroupingField,
        ignoredGroups: [...ignoredGroups],
      },
    }));

    // Verify initial state
    const initialState = useSubTaskProgressBoardPropertyStore.getState().data;
    expect(initialState.groupingField).toBe(initialGroupingField);
    expect(initialState.ignoredGroups).toEqual(ignoredGroups);
    expect(initialState.ignoredGroups.length).toBe(2);

    // ACT - change the grouping field
    setGroupingField(newGroupingField);

    // ASSERT - verify the store state was updated correctly
    const updatedState = useSubTaskProgressBoardPropertyStore.getState().data;

    // Grouping field should be changed
    expect(updatedState.groupingField).toBe(newGroupingField);

    // Ignored groups should be cleared
    expect(updatedState.ignoredGroups).toEqual([]);
    expect(updatedState.ignoredGroups.length).toBe(0);
  });

  // Test all possible grouping field values
  const groupingFields: GroupFields[] = ['project', 'assignee', 'reporter', 'priority', 'creator', 'issueType'];

  groupingFields.forEach(field => {
    it(`should set grouping field to ${field}`, () => {
      // ARRANGE - set a different initial grouping field
      const initialField: GroupFields = field === 'project' ? 'assignee' : 'project';

      useSubTaskProgressBoardPropertyStore.setState(state => ({
        ...state,
        data: {
          ...state.data,
          groupingField: initialField,
        },
      }));

      // ACT - set the new grouping field
      setGroupingField(field);

      // ASSERT - verify the grouping field was updated
      expect(useSubTaskProgressBoardPropertyStore.getState().data.groupingField).toBe(field);
    });
  });
});
