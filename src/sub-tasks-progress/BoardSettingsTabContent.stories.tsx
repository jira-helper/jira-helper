import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';

import { useJiraBoardPropertiesStore } from 'src/shared/jira/stores/jiraBoardProperties/jiraBoardProperties';
import { withStore } from 'src/shared/testTools/storyWithStore';
import { withDi } from 'src/shared/testTools/storyWithDi';
import { BoardSettingsTabContent } from './BoardSettingsTabContent';

const meta: Meta<typeof BoardSettingsTabContent> = {
  title: 'Features/Sub-tasks Progress/BoardSettingsTabContent',
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
    withStore(useJiraBoardPropertiesStore, {
      properties: {
        'sub-task-progress': {
          value: {
            columnsToTrack: ['Column 1', 'Column 3', 'Column 4 (only in board property)'],
          },
          loading: false,
        },
      },
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
    withStore(useJiraBoardPropertiesStore, {
      properties: {
        'sub-task-progress': {
          value: {
            columnsToTrack: Array.from({ length: 15 }, (_, i) => `Column ${i + 1}`),
          },
          loading: false,
        },
      },
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
    withStore(useJiraBoardPropertiesStore, {
      properties: {
        'sub-task-progress': {
          value: {
            columnsToTrack: ['Column 1', 'Column 3', 'Column 4 (only in board property)'],
          },
          loading: false,
        },
      },
    }),
  ],
};
