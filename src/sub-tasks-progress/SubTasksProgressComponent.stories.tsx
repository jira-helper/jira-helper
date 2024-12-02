import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';
import { jiraColorScheme } from './colorSchemas';
import { subTasksProgress } from './testData';

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

const defaultColorScheme = jiraColorScheme;

export const SmallMixed: Story = {
  args: {
    progress: subTasksProgress.smallMixed,
    colorScheme: defaultColorScheme,
  },
};

export const LargeMixed: Story = {
  args: {
    progress: subTasksProgress.largeMixed,
    colorScheme: defaultColorScheme,
  },
};

export const LargeSameStatus: Story = {
  args: {
    progress: subTasksProgress.largeSameStatus,
    colorScheme: defaultColorScheme,
  },
};

export const SmallSameStatus: Story = {
  args: {
    progress: subTasksProgress.smallSameStatus,
    colorScheme: defaultColorScheme,
  },
};

export const Empty: Story = {
  args: {
    progress: subTasksProgress.empty,
    colorScheme: defaultColorScheme,
  },
};
