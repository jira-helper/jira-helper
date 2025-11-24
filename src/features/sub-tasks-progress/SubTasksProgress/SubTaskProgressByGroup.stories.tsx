import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SubTaskProgressByGroup } from './SubTaskProgressByGroup';
import { subTasksProgress } from './testData';

const meta: Meta<typeof SubTaskProgressByGroup> = {
  title: 'Features/Sub-tasks Progress/SubTaskProgressByGroup',
  component: SubTaskProgressByGroup,
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
type Story = StoryObj<typeof SubTaskProgressByGroup>;

export const Default: Story = {
  args: {
    groupName: 'Group A',
    progress: subTasksProgress.smallMixed,
  },
};

export const WithWarning: Story = {
  args: {
    groupName: 'Group A',
    progress: subTasksProgress.smallMixed,

    warning: <div>Unknown statuses, map it</div>,
  },
};
