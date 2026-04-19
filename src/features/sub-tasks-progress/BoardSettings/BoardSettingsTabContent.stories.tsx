import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Ok } from 'ts-results';
import { globalContainer } from 'dioma';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';

import { withStore } from 'src/shared/testTools/storyWithStore';
import { withDi } from 'src/shared/testTools/storyWithDi';
import { BoardSettingsTabContent } from './BoardSettingsTabContent';
import { useSubTaskProgressBoardPropertyStore } from '../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

globalContainer.register({
  token: JiraServiceToken,
  value: {
    fetchJiraIssue: () => Promise.resolve(new Ok({ key: 'MOCK-1', fields: {} } as any)),
    fetchSubtasks: () => Promise.resolve(new Ok({ subtasks: [], total: 0 } as any)),
    getExternalIssues: () => Promise.resolve(new Ok([])),
    getProjectFields: () => Promise.resolve(new Ok([{ id: 'priority', name: 'Priority', schema: { type: 'string' } }])),
    getIssueLinkTypes: () =>
      Promise.resolve(new Ok([{ id: '1', name: 'Blocks', inward: 'is blocked by', outward: 'blocks' }])),
  },
});

const meta: Meta<typeof BoardSettingsTabContent> = {
  title: 'SubTasksProgress/BoardSettings/BoardSettingsTabContent',
  component: BoardSettingsTabContent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type StoryType = StoryObj<typeof BoardSettingsTabContent>;

export const Default: StoryType = {
  args: {
    onSave: () => {},
    onCancel: () => {},
  },
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObject,
          getColumns: () => ['Column 1', 'Column 2', 'Column 3', 'Column 5 (only in board)'],
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      data: {
        ...useSubTaskProgressBoardPropertyStore.getInitialState().data,
        columnsToTrack: ['Column 1', 'Column 3', 'Column 4 (only in board property)'],
      },
      state: 'loaded',
    }),
  ],
};

export const aLotOfColumns: StoryType = {
  args: {
    onSave: () => {},
    onCancel: () => {},
    initialValues: {
      enabled: true,
      showSubTasksProgress: true,
      showParentProgress: true,
    },
  },
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObject,
          getColumns: () => Array.from({ length: 15 }, (_, i) => `Column ${i + 1}`),
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      data: {
        ...useSubTaskProgressBoardPropertyStore.getInitialState().data,
        columnsToTrack: Array.from({ length: 15 }, (_, i) => `Column ${i + 1}`),
      },
      state: 'loaded',
    }),
  ],
};

export const boardPropertyHasColumnThatIsNotInBoardAndBoardPropertyHasColumnsThatAreNotInBoardProperty: StoryType = {
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObject,
          getColumns: () => ['Column 1', 'Column 2', 'Column 3', 'Column 5 (only in board)'],
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      data: {
        ...useSubTaskProgressBoardPropertyStore.getInitialState().data,
        columnsToTrack: ['Column 1', 'Column 3', 'Column 4 (only in board property)'],
      },
      state: 'loaded',
    }),
  ],
};
