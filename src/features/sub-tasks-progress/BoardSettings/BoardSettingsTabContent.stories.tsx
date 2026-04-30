/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Ok } from 'ts-results';
import { globalContainer } from 'dioma';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';
import type { JiraStatus } from 'src/infrastructure/jira/types';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';

import { withStore } from 'src/shared/testTools/storyWithStore';
import { withDi } from 'src/shared/testTools/storyWithDi';
import { BoardSettingsTabContent } from './BoardSettingsTabContent';
import { useSubTaskProgressBoardPropertyStore } from '../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

const storyStatuses: JiraStatus[] = [
  { id: '1', name: 'To Do', statusCategory: { id: 2, key: 'new', colorName: 'blue-gray', name: 'To Do' } },
  {
    id: '2',
    name: 'In Progress',
    statusCategory: { id: 4, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  { id: '3', name: 'Done', statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' } },
];

globalContainer.register({
  token: JiraServiceToken,
  value: {
    fetchJiraIssue: () => Promise.resolve(new Ok({ key: 'MOCK-1', fields: {} } as any)),
    fetchSubtasks: () => Promise.resolve(new Ok({ subtasks: [], total: 0 } as any)),
    getExternalIssues: () => Promise.resolve(new Ok([])),
    getProjectFields: () => Promise.resolve(new Ok([{ id: 'priority', name: 'Priority', schema: { type: 'string' } }])),
    getIssueLinkTypes: () =>
      Promise.resolve(new Ok([{ id: '1', name: 'Blocks', inward: 'is blocked by', outward: 'blocks' }])),
    getStatuses: () => Promise.resolve(new Ok(storyStatuses)),
    addWatcher: () => Promise.resolve(new Ok(undefined)),
  },
});

const meta: Meta<typeof BoardSettingsTabContent> = {
  title: 'SubTasksProgress/BoardSettings/BoardSettingsTabContent',
  component: BoardSettingsTabContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    withStore(useJiraStatusesStore, {
      statuses: storyStatuses,
      isLoading: false,
      error: null,
    }),
    Story => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type StoryType = StoryObj<typeof BoardSettingsTabContent>;

const boardColumns = ['Column 1', 'Column 2', 'Column 3', 'Column 5 (only in board)'];

const baseBoardPropertyData = {
  ...useSubTaskProgressBoardPropertyStore.getInitialState().data,
  columnsToTrack: ['Column 1', 'Column 3', 'Column 4 (only in board property)'],
};

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
          getColumns: () => boardColumns,
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      data: baseBoardPropertyData,
      state: 'loaded',
    }),
  ],
};

export const EmptyStatusProgressMapping: StoryType = {
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObject,
          getColumns: () => boardColumns,
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      data: baseBoardPropertyData,
      state: 'loaded',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Shows the final production placement of Status progress mapping after Counting settings and before Task Progress Tracking, with no saved rows.',
      },
    },
  },
};

export const WithStatusProgressMapping: StoryType = {
  decorators: [
    withDi(container => {
      container.register({
        token: boardPagePageObjectToken,
        value: {
          ...BoardPagePageObject,
          getColumns: () => boardColumns,
        },
      });
    }),
    withStore(useSubTaskProgressBoardPropertyStore, {
      data: {
        ...baseBoardPropertyData,
        statusProgressMapping: {
          '1': { statusId: '1', statusName: 'To Do', bucket: 'todo' },
          '2': { statusId: '2', statusName: 'In Progress', bucket: 'inProgress' },
          '3': { statusId: '3', statusName: 'Done', bucket: 'done' },
        },
      },
      state: 'loaded',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Shows saved sub-tasks progress mappings keyed by Jira status id with fallback labels captured in board property data.',
      },
    },
  },
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
