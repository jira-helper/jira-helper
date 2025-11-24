import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';

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

type Story = StoryObj<typeof SubTasksProgressComponent>;

export const SmallMixed: Story = {
  args: {
    progress: subTasksProgress.smallMixed,
  },
};

export const LargeMixed: Story = {
  args: {
    progress: subTasksProgress.largeMixed,
  },
};

export const LargeSameStatus: Story = {
  args: {
    progress: subTasksProgress.largeSameStatus,
  },
};

export const SmallSameStatus: Story = {
  args: {
    progress: subTasksProgress.smallSameStatus,
  },
};

export const Empty: Story = {
  args: {
    progress: subTasksProgress.empty,
  },
};
