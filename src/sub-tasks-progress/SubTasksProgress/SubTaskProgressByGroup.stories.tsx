import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SubTaskProgressByGroup } from './SubTaskProgressByGroup';
import { defaultColorScheme, subTasksProgress } from './testData';

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
    colorScheme: defaultColorScheme,
  },
};

export const WithWarning: Story = {
  args: {
    groupName: 'Group A',
    progress: subTasksProgress.smallMixed,
    colorScheme: defaultColorScheme,
    warning: <div>Unkown statuses, map it</div>,
  },
};
