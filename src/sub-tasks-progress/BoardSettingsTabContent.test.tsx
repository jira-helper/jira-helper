import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Container, globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken, BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { BoardSettingsTabContent } from './BoardSettingsTabContent';
import { useSubTaskProgressBoardPropertyStore } from './stores/subTaskProgressBoardProperty';

function setup({
  columnsOnBoard,
  columnsOnBoardProperty,
}: {
  columnsOnBoard: string[];
  columnsOnBoardProperty: string[];
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

  const getBoardPropertySpy = vi.fn(() => ({
    columnsToTrack: columnsOnBoardProperty,
  }));
  container.register({
    token: BoardPropertyServiceToken,
    value: {
      getBoardProperty: getBoardPropertySpy,
    },
  });

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
  it('should render columns only preset in board', async () => {
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

    const columns = screen.getAllByTestId('sub-task-progress-column');

    // check that first colum is Column 1 and selected
    expect(columns[0].querySelector('[data-testid="sub-task-progress-column-name"]')).toHaveTextContent('Column 1');
    expect(columns[0].querySelector('[data-testid="sub-task-progress-column-checkbox"]')).toBeChecked();
    // check that second column is Column 2 and not selected
    expect(columns[1].querySelector('[data-testid="sub-task-progress-column-name"]')).toHaveTextContent('Column 2');
    expect(columns[1].querySelector('[data-testid="sub-task-progress-column-checkbox"]')).not.toBeChecked();
    // check that third column is not displayed
    expect(columns[2]).toBeUndefined();

    // check that board property requested
    const boardPropertyService = container.inject(BoardPropertyServiceToken);
    expect(boardPropertyService.getBoardProperty).toHaveBeenCalledWith('sub-task-progress');
  });
});
