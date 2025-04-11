import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { withDi } from 'src/shared/testTools/storyWithDi';
import { withStore } from 'src/shared/testTools/storyWithStore';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

import { BoardPagePageObjectMock } from 'src/page-objects/BoardPage.mock';
import { ColumnsSettingsContainer } from './ColumnSettings';

const meta: Meta<typeof ColumnsSettingsContainer> = {
  title: 'SubTasksProgress/BoardSettings/ColumnSettings',
  component: ColumnsSettingsContainer,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type StoryType = StoryObj<typeof ColumnsSettingsContainer>;

// Container component stories
export const Default: StoryType = {
  render: () => <ColumnsSettingsContainer />,
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObjectMock,
          getColumns: () => ['Column From Board 1', 'Column From Board 2', 'Column From Board 3'],
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      ...useSubTaskProgressBoardPropertyStore.getInitialState(),
      data: {
        ...useSubTaskProgressBoardPropertyStore.getInitialState().data,
        columnsToTrack: ['Column From Board 1', 'Column From Property'],
      },
      state: 'loaded',
    }),
  ],
};

export const LotOfColumns: StoryType = {
  render: () => <ColumnsSettingsContainer />,
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObjectMock,
          getColumns: () => [
            'Column From Board 1',
            'Column From Board 2',
            'Column From Board 3',
            'Column From Board 4',
            'Column From Board 5',
            'Column From Board 6',
            'Column From Board 7',
            'Column From Board 8',
            'Column From Board 9',
            'Column From Board 10',
          ],
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      ...useSubTaskProgressBoardPropertyStore.getInitialState(),
      data: {
        ...useSubTaskProgressBoardPropertyStore.getInitialState().data,
        columnsToTrack: [
          'Column From Board 1',
          'Column From Property',
          'Column From Board 2',
          'Column From Board 3',
          'Column From Board 4',
          'Column From Board 5',
          'Column From Board 6',
          'Column From Board 7',
          'Column From Board 8',
          'Column From Board 9',
          'Column From Board 10',
        ],
        // Add other required properties if needed
      },
      state: 'loaded',
    }),
  ],
};

export const Loading: StoryType = {
  render: () => <ColumnsSettingsContainer />,
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObjectMock,
          getColumns: () => ['To Do', 'In Progress', 'Done'],
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      ...useSubTaskProgressBoardPropertyStore.getInitialState(),
      state: 'loading',
    }),
  ],
};
