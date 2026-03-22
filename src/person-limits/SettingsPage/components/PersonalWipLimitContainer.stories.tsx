import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JiraUser } from 'src/shared/jiraApi';
import { PersonalWipLimitContainer } from './PersonalWipLimitContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { PersonLimit } from '../../property/types';

const meta: Meta<typeof PersonalWipLimitContainer> = {
  title: 'PersonLimits/SettingsPage/PersonalWipLimitContainer',
  component: PersonalWipLimitContainer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PersonalWipLimitContainer>;

const mockColumns = [
  { id: 'col1', name: 'To Do', isKanPlanColumn: false },
  { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
  { id: 'col3', name: 'Done', isKanPlanColumn: false },
];

const mockSwimlanes = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
];

const mockJiraUsers: JiraUser[] = [
  {
    name: 'john.doe',
    displayName: 'John Doe',
    avatarUrls: { '16x16': 'https://via.placeholder.com/16', '32x32': 'https://via.placeholder.com/32' },
    self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
  },
  {
    name: 'jane.smith',
    displayName: 'Jane Smith',
    avatarUrls: { '16x16': 'https://via.placeholder.com/16', '32x32': 'https://via.placeholder.com/32' },
    self: 'https://jira.example.com/rest/api/2/user?username=jane.smith',
  },
  {
    name: 'bob.jones',
    displayName: 'Bob Jones',
    avatarUrls: { '16x16': 'https://via.placeholder.com/16', '32x32': 'https://via.placeholder.com/32' },
    self: 'https://jira.example.com/rest/api/2/user?username=bob.jones',
  },
];

const mockSearchUsers = async (query: string): Promise<JiraUser[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockJiraUsers.filter(
    u => u.name.toLowerCase().includes(query.toLowerCase()) || u.displayName.toLowerCase().includes(query.toLowerCase())
  );
};

const ContainerWrapper: React.FC<{
  children: React.ReactNode;
  initialLimits?: PersonLimit[];
}> = ({ children, initialLimits = [] }) => {
  React.useEffect(() => {
    useSettingsUIStore.getState().actions.reset();
    if (initialLimits.length > 0) {
      useSettingsUIStore.getState().actions.setData(initialLimits);
    }
  }, [initialLimits]);
  return children;
};

export const EmptyState: Story = {
  render: () => (
    <ContainerWrapper>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerWrapper>
  ),
};

export const AddMode: Story = {
  render: () => (
    <ContainerWrapper>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerWrapper>
  ),
};

export const EditMode: Story = {
  render: () => {
    const limit: PersonLimit = {
      id: 1,
      person: {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/user',
        avatar: 'https://via.placeholder.com/32',
      },
      limit: 5,
      columns: [{ id: 'col1', name: 'To Do' }],
      swimlanes: [{ id: 'swim1', name: 'Frontend' }],
    };

    return (
      <ContainerWrapper initialLimits={[limit]}>
        <PersonalWipLimitContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={async () => {}}
        />
      </ContainerWrapper>
    );
  },
  play: async ({ canvasElement }) => {
    const editButton = canvasElement.querySelector('[data-testid="edit-button-1"]') as HTMLElement;
    if (editButton) {
      editButton.click();
    }
  },
};

export const EditModeWithAllColumns: Story = {
  render: () => {
    const limit: PersonLimit = {
      id: 1,
      person: {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/user',
        avatar: 'https://via.placeholder.com/32',
      },
      limit: 5,
      columns: [],
      swimlanes: [],
    };

    return (
      <ContainerWrapper initialLimits={[limit]}>
        <PersonalWipLimitContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={async () => {}}
        />
      </ContainerWrapper>
    );
  },
  play: async ({ canvasElement }) => {
    const editButton = canvasElement.querySelector('[data-testid="edit-button-1"]') as HTMLElement;
    if (editButton) {
      editButton.click();
    }
  },
};

export const WithMultipleLimits: Story = {
  render: () => {
    const limits: PersonLimit[] = [
      {
        id: 1,
        person: {
          name: 'john.doe',
          displayName: 'John Doe',
          self: 'https://jira.example.com/user',
          avatar: 'https://via.placeholder.com/32',
        },
        limit: 3,
        columns: [{ id: 'col1', name: 'To Do' }],
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      },
      {
        id: 2,
        person: {
          name: 'jane.smith',
          displayName: 'Jane Smith',
          self: 'https://jira.example.com/user',
          avatar: 'https://via.placeholder.com/32',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      },
    ];

    return (
      <ContainerWrapper initialLimits={limits}>
        <PersonalWipLimitContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={async () => {}}
        />
      </ContainerWrapper>
    );
  },
};
