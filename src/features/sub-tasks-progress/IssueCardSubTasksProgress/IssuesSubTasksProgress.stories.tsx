import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IssuesSubTasksProgressPure } from './IssuesSubTasksProgress';
import { subTasksProgress, defaultColorScheme } from '../SubTasksProgress/testData';

const meta: Meta<typeof IssuesSubTasksProgressPure> = {
  title: 'Features/Sub-tasks Progress/IssuesSubTasksProgressPure',
  component: IssuesSubTasksProgressPure,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssuesSubTasksProgressPure>;

export const Default: Story = {
  args: {
    subtasksProgressByGroup: {
      group1: { progress: subTasksProgress.smallMixed, comments: [] },
      group2: { progress: subTasksProgress.smallMixed, comments: ['comment'] },
      groupWithLongName: {
        progress: subTasksProgress.largeMixed,
        comments: ['comment1', 'comment2', 'comment3', 'comment4', 'comment5', 'comment6', 'comment7', 'comment8'],
      },
      group4: { progress: subTasksProgress.largeSameStatus, comments: [] },
      group5: { progress: subTasksProgress.smallSameStatus, comments: [] },
    },
    colorScheme: defaultColorScheme,
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
    subtasksProgressByGroup: {
      group1: { progress: subTasksProgress.smallMixed, comments: [] },
      group2: { progress: subTasksProgress.smallMixed, comments: ['comment'] },
      groupWithLongName: {
        progress: subTasksProgress.largeMixed,
        comments: ['comment1', 'comment2', 'comment3', 'comment4', 'comment5', 'comment6', 'comment7', 'comment8'],
      },
      group4: { progress: subTasksProgress.largeSameStatus, comments: [] },
      group5: { progress: subTasksProgress.smallSameStatus, comments: [] },
    },
    colorScheme: defaultColorScheme,
  },
  decorators: [
    S => (
      <div style={{ width: '100vw' }}>
        <S />
      </div>
    ),
  ],
};
