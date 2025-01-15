import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken, BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { moveBoardStatusToProgressStatus } from 'src/sub-tasks-progress/actions/moveBoardStatusToProgressStatus';
import { BoardSettingsTabContent } from './BoardSettingsTabContent';
import { useSubTaskProgressBoardPropertyStore } from '../../stores/subTaskProgressBoardProperty';
import { BoardSettingsTabContentPageObject } from './BoardSettingsTabContent.pageObject';

import { AvailableColorSchemas } from '../../colorSchemas';
import { BoardProperty, GroupFields, Status } from '../../types';

function setup({
  columnsOnBoard,
  columnsOnBoardProperty,
  colorScheme,
  groupingField,
  statusMapping,
}: {
  columnsOnBoard: string[];
  columnsOnBoardProperty: string[];
  colorScheme?: AvailableColorSchemas;
  groupingField?: GroupFields;
  statusMapping?: Record<string, Status>;
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
        statusMapping,
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

  useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());

  return { container };
}

describe('BoardSettingsTabContent', () => {
  it.skip('should render', () => {
    const container = globalContainer;
    container.register({
      token: boardPagePageObjectToken,
      value: {
        ...BoardPagePageObject,
        getColumns: () => ['Column1', 'Column 2', 'Column 3', 'Column 5 (only in board)'],
      },
    });
    // @ts-expect-error
    container.register({
      token: BoardPropertyServiceToken,
      value: {
        getBoardProperty: () =>
          Promise.resolve({
            statusMapping: {
              'Column 1': 'status1',
              'Column 2': 'status2',
              'Column 3': 'status3',
            },
          }),
      },
    });
    render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );
  });
  it('should render columns only presented at board', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
    });

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

    // Then it should update board property with new state of columns
    const boardPropertyService = container.inject(BoardPropertyServiceToken);
    expect(boardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
      'sub-task-progress',
      {
        columnsToTrack: ['Column 1', 'Column 2'],
      },
      {}
    );

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
    { initialScheme: undefined, expectedScheme: 'jira' } as const,
    { initialScheme: 'jira', expectedScheme: 'jira' } as const,
    { initialScheme: 'yellowGreen', expectedScheme: 'yellowGreen' } as const,
  ])(
    'When board property has colorscheme with value $initialScheme, it should render $expectedScheme',
    async ({ initialScheme, expectedScheme }) => {
      const { container } = setup({
        columnsOnBoard: ['Column 1', 'Column 2'],
        columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
        colorScheme: initialScheme,
      });

      render(
        <WithDi container={container}>
          <BoardSettingsTabContent />
        </WithDi>
      );
      await waitFor(() => {
        expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
      });

      const colorScheme = BoardSettingsTabContentPageObject.getColorScheme();
      expect(colorScheme).toEqual(expectedScheme);
    }
  );

  it('should update colorScheme', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
      colorScheme: 'yellowGreen',
    });

    render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    BoardSettingsTabContentPageObject.setColorScheme('jira');

    // check current color scheme
    await waitFor(() => {
      const colorScheme = BoardSettingsTabContentPageObject.getColorScheme();
      expect(colorScheme).toEqual('jira');
    });

    // check that board property updated
    const boardPropertyService = container.inject(BoardPropertyServiceToken);
    expect(boardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
      'sub-task-progress',
      {
        columnsToTrack: ['Column 1', 'Column 3 (only in board)'],
        selectedColorScheme: 'jira',
      },
      {}
    );

    // check that board property in inner state is updated
    expect(useSubTaskProgressBoardPropertyStore.getState().data!.selectedColorScheme).toEqual('jira');
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

    render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    BoardSettingsTabContentPageObject.setGroupingField('assignee');

    await waitFor(() => {
      // check that board property updated
      const boardPropertyService = container.inject(BoardPropertyServiceToken);
      expect(boardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
        'sub-task-progress',
        {
          columnsToTrack: ['Column 1', 'Column 3 (only in board)'],
          groupingField: 'assignee',
          selectedColorScheme: undefined,
        },
        {}
      );
    });

    // check that inner state is updated
    expect(useSubTaskProgressBoardPropertyStore.getState().data!.groupingField).toEqual('assignee');

    // check that new grouping field is selected
    const updatedGroupingField = BoardSettingsTabContentPageObject.getGroupingField();
    expect(updatedGroupingField).toEqual('assignee');
  });

  it('should render status mapping', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
      colorScheme: 'jira',
      statusMapping: {
        status1: 'done',
      },
    });

    render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    const statusMapping = BoardSettingsTabContentPageObject.getStatusMapping();
    expect(statusMapping).toEqual({
      status1: 'done',
    });
  });

  it('should update status mapping', async () => {
    const { container } = setup({
      columnsOnBoard: ['Column 1', 'Column 2'],
      columnsOnBoardProperty: ['Column 1', 'Column 3 (only in board)'],
      colorScheme: 'jira',
      statusMapping: {
        status1: 'done',
      },
    });

    render(
      <WithDi container={container}>
        <BoardSettingsTabContent />
      </WithDi>
    );

    await waitFor(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().state).toEqual('loaded');
    });

    await moveBoardStatusToProgressStatus('status2', 'inProgress');

    await waitFor(() => {
      // check that board property updated
      const boardPropertyService = container.inject(BoardPropertyServiceToken);
      expect(boardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
        'sub-task-progress',
        {
          columnsToTrack: ['Column 1', 'Column 3 (only in board)'],
          groupingField: undefined,
          selectedColorScheme: 'jira',
          statusMapping: {
            status1: 'done',
            status2: 'inProgress',
          },
        },
        {}
      );
    });

    // check that inner state is updated
    expect(useSubTaskProgressBoardPropertyStore.getState().data!.statusMapping).toEqual({
      status1: 'done',
      status2: 'inProgress',
    });

    // check that new grouping field is selected
    const updatedStatusMapping = BoardSettingsTabContentPageObject.getStatusMapping();
    expect(updatedStatusMapping).toEqual({
      status1: 'done',
      status2: 'inProgress',
    });
  });
});
