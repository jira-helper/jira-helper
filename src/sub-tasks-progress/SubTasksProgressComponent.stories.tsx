import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';

const meta: Meta<typeof SubTasksProgressComponent> = {
  title: 'Features/Sub-tasks Progress/SubTasksProgressComponent',
  component: SubTasksProgressComponent,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{ width: '200px' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
// export default {
//   ...meta,
//   //   decorators: [
//   //     Story => (
//   //       <div style={{ width: '200px' }}>
//   //         <Story />
//   //       </div>
//   //     ),
//   //   ],
// };
type Story = StoryObj<typeof SubTasksProgressComponent>;

const defaultColorScheme = {
  backlog: '#d9d9d9',
  todo: '#ffd591',
  inProgress: '#91caff',
  almostDone: '#b7eb8f',
  done: '#52c41a',
};

export const SmallMixedCount: Story = {
  args: {
    progress: {
      backlog: 1,
      todo: 1,
      inProgress: 1,
      almostDone: 0,
      done: 2,
    },
    colorScheme: defaultColorScheme,
  },
};

export const LargeMixedCount: Story = {
  args: {
    progress: {
      backlog: 5,
      todo: 8,
      inProgress: 12,
      almostDone: 7,
      done: 15,
    },
    colorScheme: defaultColorScheme,
  },
};

export const LargeSameStatus: Story = {
  args: {
    progress: {
      backlog: 0,
      todo: 0,
      inProgress: 25,
      almostDone: 0,
      done: 0,
    },
    colorScheme: defaultColorScheme,
  },
};

export const SmallSameStatus: Story = {
  args: {
    progress: {
      backlog: 0,
      todo: 3,
      inProgress: 0,
      almostDone: 0,
      done: 0,
    },
    colorScheme: defaultColorScheme,
  },
};

export const Empty: Story = {
  args: {
    progress: {
      backlog: 0,
      todo: 0,
      inProgress: 0,
      almostDone: 0,
      done: 0,
    },
    colorScheme: defaultColorScheme,
  },
};
