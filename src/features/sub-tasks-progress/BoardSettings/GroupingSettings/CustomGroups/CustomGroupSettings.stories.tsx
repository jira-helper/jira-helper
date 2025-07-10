import type { Meta, StoryObj } from '@storybook/react';
import { CustomGroupSettings } from './CustomGroupSettings';

const meta: Meta<typeof CustomGroupSettings> = {
  title: 'Features/SubTasksProgress/BoardSettings/GroupingSettings/CustomGroupSettings',
  component: CustomGroupSettings,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onAddGroup: { action: 'onAddGroup' },
    onUpdateGroup: { action: 'onUpdateGroup' },
    onRemoveGroup: { action: 'onRemoveGroup' },
  },
};

export default meta;
type Story = StoryObj<typeof CustomGroupSettings>;

const FIELD_NAMES = [
  'Team',
  'IssueType',
  'Size',
  'Priority',
  'Assignee',
  'Reporter',
  'Status',
  'Labels',
  'Components',
  'Epic Link',
];

export const Empty: Story = {
  args: {
    groups: [],
    fields: FIELD_NAMES.map(name => ({ id: name, name })),
  },
};

export const WithProgressGroups: Story = {
  args: {
    groups: [
      {
        id: 1,
        name: 'Team A',
        description: 'Tasks for Team A',
        fieldId: 'Team',
        value: 'Team A',
        showAsCounter: false,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#3b82f6',
        hideIfFull: false,
      },
      {
        id: 2,
        name: 'Team B',
        description: 'Tasks for Team B',
        fieldId: 'Team',
        value: 'Team B',
        showAsCounter: false,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#3b82f6',
        hideIfFull: false,
      },
    ],
    fields: FIELD_NAMES.map(name => ({ id: name, name })),
  },
};

export const WithCounterGroups: Story = {
  args: {
    groups: [
      {
        id: 1,
        name: 'High Priority',
        description: 'High priority tasks',
        fieldId: 'Priority',
        value: 'High',
        showAsCounter: true,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#ef4444',
        hideIfFull: true,
      },
      {
        id: 2,
        name: 'Medium Priority',
        description: 'Medium priority tasks',
        fieldId: 'Priority',
        value: 'Medium',
        showAsCounter: true,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#f59e0b',
        hideIfFull: true,
      },
    ],
    fields: FIELD_NAMES.map(name => ({ id: name, name })),
  },
};

export const MixedGroups: Story = {
  args: {
    groups: [
      {
        id: 1,
        name: 'Team A',
        description: 'Team A description',
        fieldId: 'Team',
        value: 'Team A',
        showAsCounter: false,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#3b82f6',
        hideIfFull: false,
      },
      {
        id: 2,
        name: 'Team B',
        description: 'Team B description',
        fieldId: 'Team',
        value: 'Team B',
        showAsCounter: true,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#3b82f6',
        hideIfFull: true,
      },
    ],
    fields: FIELD_NAMES.map(name => ({ id: name, name })),
  },
};
