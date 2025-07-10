import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken, BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { registerLogger } from 'src/shared/Logger';
import { step } from 'src/shared/testTools/step';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { Err } from 'ts-results';
import { BoardSettingsTabContent } from './BoardSettingsTabContent';
import { BoardSettingsTabContentPageObject } from './BoardSettingsTabContent.pageObject';

import { AvailableColorSchemas } from '../colorSchemas';
import { BoardProperty, GroupFields, Status } from '../types';
import { loadSubTaskProgressBoardProperty } from '../SubTaskProgressSettings/actions/loadSubTaskProgressBoardProperty';

function setup({
  columnsOnBoard,
  columnsOnBoardProperty,
  colorScheme,
  groupingField,
  statusMapping,
  useCustomColorScheme,
}: {
  columnsOnBoard: string[];
  columnsOnBoardProperty: string[];
  colorScheme?: AvailableColorSchemas;
  groupingField?: GroupFields;
  statusMapping?: Record<number, { progressStatus: Status; name: string }>;
  useCustomColorScheme?: boolean;
}) {
  const container = globalContainer;
  const getColumnsSpy = vi.fn(() => columnsOnBoard);
  container.register({
    token: boardPagePageObjectToken,
    value: {
      ...BoardPagePageObject,
      getColumns: getColumnsSpy,
    },
  });

  const getBoardPropertySpy = vi.fn(
    () =>
      Promise.resolve({
        columnsToTrack: columnsOnBoardProperty,
        selectedColorScheme: colorScheme,
        groupingField,
        newStatusMapping: statusMapping,
        useCustomColorScheme,
      }) as Promise<BoardProperty>
  );
  const updateBoardPropertySpy = vi.fn();
  // @ts-expect-error
  container.register({
    token: BoardPropertyServiceToken,
    value: {
      getBoardProperty: getBoardPropertySpy,
      updateBoardProperty: updateBoardPropertySpy,
    },
  });

  container.register({
    token: JiraServiceToken,
    // @ts-expect-error minimal mock
    value: {
      getProjectFields: vi.fn(() => Promise.resolve(Err(new Error('test')))),
    },
  });

  useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());

  registerLogger(container);

  return { container };
}

describe('BoardSettingsTabContent', () => {
  it('should render columns only presented at board', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
    });

    await loadSubTaskProgressBoardProperty();

    const { rerender } = render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    rerender(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    const columns = BoardSettingsTabContentPageObject.getColumns();

    // check that first colum is Column 1 and selected
    expect(columns.length).toEqual(2);

    expect(columns[0]).toMatchObject({ name: 'Column 1', checked: true });
    expect(columns[1]).toMatchObject({ name: 'Column 2', checked: false });

    // check that board property requested
    const boardPropertyService = container.inject(BoardPropertyServiceToken);
    expect(boardPropertyService.getBoardProperty).toHaveBeenCalledWith('sub-task-progress');
  });

  it('when coulumn changed should update property and rerender', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
    });

    await loadSubTaskProgressBoardProperty();

    const { rerender } = render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    const columns = BoardSettingsTabContentPageObject.getColumns();

    // When user clicks on disabled column
    const disabledColumn = columns.find(c => !c.checked);
    if (!disabledColumn) {
      throw new Error('Disabled column not found');
    }
    disabledColumn.click();

    // Then it should update inner state of columns
    expect(useSubTaskProgressBoardPropertyStore.getState().data!.columnsToTrack).toEqual(['Column 1', 'Column 2']);

    // Then it should rerender and columns should be updated
    rerender(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    const updatedColumn = BoardSettingsTabContentPageObject.getColumns().find(c => c.name === disabledColumn.name);
    expect(updatedColumn).toMatchObject({ name: disabledColumn.name, checked: true });
  });

  it.each([
    { initialGrouping: undefined, expectedGrouping: 'project' } as const,
    { initialGrouping: 'project', expectedGrouping: 'project' } as const,
    { initialGrouping: 'assignee', expectedGrouping: 'assignee' } as const,
    { initialGrouping: 'reporter', expectedGrouping: 'reporter' } as const,
    { initialGrouping: 'priority', expectedGrouping: 'priority' } as const,
    { initialGrouping: 'creator', expectedGrouping: 'creator' } as const,
    { initialGrouping: 'issueType', expectedGrouping: 'issueType' } as const,
  ])(
    'When board property has grouping field with value $initialGrouping, it should render $expectedGrouping',
    async ({ initialGrouping, expectedGrouping }) => {
      const { container } = setup({
        columnsOnBoard: ['Column 1', 'Column 2'],
        columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
        groupingField: initialGrouping,
      });

      await loadSubTaskProgressBoardProperty();

      render(
        <WithDi container={container}>
          <BoardSettingsTabContent />
        </WithDi>
      );

      await waitFor(() => {
        expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
      });

      const groupingField = BoardSettingsTabContentPageObject.getGroupingField();
      expect(groupingField).toEqual(expectedGrouping);
    }
  );

  it('should update grouping field', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
      groupingField: 'project',
    });

    await loadSubTaskProgressBoardProperty();

    render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    BoardSettingsTabContentPageObject.setGroupingField('assignee');

    // check that inner state is updated
    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().data!.groupingField).toEqual('assignee');
    });

    // check that new grouping field is selected
    const updatedGroupingField = BoardSettingsTabContentPageObject.getGroupingField();
    expect(updatedGroupingField).toEqual('assignee');
  });

  it('enabled and disabled settings', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
      colorScheme: 'jira',
      statusMapping: {
        1: {
          name: 'status1',
          progressStatus: 'done',
        },
      },
      useCustomColorScheme: true,
    });

    step('Given: settings are enabled', async () => {});

    await step('When: user open settings tab', async () => {
      await loadSubTaskProgressBoardProperty();

      render(
        <WithDi container={container}>
          <BoardSettingsTabContent />
        </WithDi>
      );
    });

    step('When: user disables feature', () => {
      BoardSettingsTabContentPageObject.toggleEnabled();
    });

    step('Then: settings are disabled', async () => {
      step('in store data', () => {
        expect(useSubTaskProgressBoardPropertyStore.getState().data!.enabled).toEqual(false);
      });
      step('in UI', () => {
        expect(BoardSettingsTabContentPageObject.getResetButton()).toBeDisabled();
        const countSettingsCheckboxes = BoardSettingsTabContentPageObject.getCountSettingsCheckboxes();
        for (const checkbox of Object.values(countSettingsCheckboxes)) {
          expect(checkbox).toBeDisabled();
        }
      });
    });
  });
});
