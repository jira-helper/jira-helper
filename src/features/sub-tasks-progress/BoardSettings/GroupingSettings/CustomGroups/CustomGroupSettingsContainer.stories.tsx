import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Ok } from 'ts-results';
import { globalContainer } from 'dioma';
import { JiraServiceToken } from 'src/infrastructure/jira/jiraService';
import { CustomGroupSettingsContainer } from './CustomGroupSettingsContainer';

globalContainer.register({
  token: JiraServiceToken,
  value: {
    fetchJiraIssue: () => Promise.resolve(new Ok({ key: 'MOCK-1', fields: {} } as any)),
    fetchSubtasks: () => Promise.resolve(new Ok({ subtasks: [], total: 0 } as any)),
    getExternalIssues: () => Promise.resolve(new Ok([])),
    getProjectFields: () => Promise.resolve(new Ok([{ id: 'priority', name: 'Priority', schema: { type: 'string' } }])),
    getIssueLinkTypes: () =>
      Promise.resolve(new Ok([{ id: '1', name: 'Blocks', inward: 'is blocked by', outward: 'blocks' }])),
    getStatuses: () => Promise.resolve(new Ok([])),
  },
});

const meta = {
  title: 'SubTasksProgress/BoardSettings/GroupingSettings/CustomGroups/CustomGroupSettingsContainer',
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
