import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CustomGroupSettingsContainer } from './CustomGroupSettingsContainer';

const meta = {
  title: 'Features/SubTasksProgress/GroupingSettings/CustomGroupSettingsContainer',
  component: CustomGroupSettingsContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onGroupsChange: { action: 'groups changed' },
  },
} satisfies Meta<typeof CustomGroupSettingsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    initialGroups: [],
    onGroupsChange: action('groups changed'),
  },
};

export const WithInitialGroups: Story = {
  args: {
    initialGroups: [
      {
        id: 1,
        name: 'Team A',
        description: 'Team A description',
        field: 'Team',
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
        field: 'Team',
        value: 'Team B',
        showAsCounter: true,
        badgeDoneColor: '#22c55e',
        badgePendingColor: '#3b82f6',
        hideIfFull: true,
      },
    ],
    onGroupsChange: action('groups changed'),
  },
};
