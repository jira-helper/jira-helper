import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IssuesSubTasksProgressPure } from './IssuesSubTasksProgress';
import { subTasksProgress } from '../SubTasksProgress/testData';

const meta: Meta<typeof IssuesSubTasksProgressPure> = {
  title: 'Features/Sub-tasks Progress/IssuesSubTasksProgressPure',
  component: IssuesSubTasksProgressPure,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssuesSubTasksProgressPure>;

export const Default: Story = {
  args: {
    subtasksProgressBars: [
      { progress: subTasksProgress.smallMixed, comments: [], groupId: 'group1', groupName: 'Group 1' },
      { progress: subTasksProgress.smallMixed, comments: ['comment'], groupId: 'group2', groupName: 'Group 2' },
      {
        progress: subTasksProgress.largeMixed,
        comments: ['comment1', 'comment2', 'comment3', 'comment4', 'comment5', 'comment6', 'comment7', 'comment8'],
        groupId: 'groupWithLongName',
        groupName: 'Group With Long Name',
      },

      { progress: subTasksProgress.largeSameStatus, comments: [], groupId: 'group4', groupName: 'Group 4' },
      { progress: subTasksProgress.smallSameStatus, comments: [], groupId: 'group5', groupName: 'Group 5' },
    ],
  },
  decorators: [
    S => (
      <div style={{ width: '200px' }}>
        <S />
      </div>
    ),
  ],
};

export const BigContainer: Story = {
  args: {
    subtasksProgressBars: [
      { progress: subTasksProgress.smallMixed, comments: [], groupId: 'group1', groupName: 'Group 1' },
      { progress: subTasksProgress.smallMixed, comments: ['comment'], groupId: 'group2', groupName: 'Group 2' },
      {
        progress: subTasksProgress.largeMixed,
        comments: ['comment1', 'comment2', 'comment3', 'comment4', 'comment5', 'comment6', 'comment7', 'comment8'],
        groupId: 'groupWithLongName',
        groupName: 'Group With Long Name',
      },
      { progress: subTasksProgress.largeSameStatus, comments: [], groupId: 'group4', groupName: 'Group 4' },
      { progress: subTasksProgress.smallSameStatus, comments: [], groupId: 'group5', groupName: 'Group 5' },
    ],
  },
  decorators: [
    S => (
      <div style={{ width: '100vw' }}>
        <S />
      </div>
    ),
  ],
};
