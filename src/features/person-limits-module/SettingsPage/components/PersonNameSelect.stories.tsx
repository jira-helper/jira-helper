import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JiraUser } from 'src/infrastructure/jira/jiraApi';
import { PersonNameSelect } from './PersonNameSelect';
import type { SelectedPerson } from '../state/types';

const meta: Meta<typeof PersonNameSelect> = {
  title: 'PersonLimitsModule/SettingsPage/PersonNameSelect',
  component: PersonNameSelect,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PersonNameSelect>;

const mockUsers: JiraUser[] = [
  {
    name: 'john.doe',
    displayName: 'John Doe',
    avatarUrls: {
      '16x16': 'https://via.placeholder.com/16',
      '32x32': 'https://via.placeholder.com/32',
    },
    self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
  },
  {
    name: 'jane.smith',
    displayName: 'Jane Smith',
    avatarUrls: {
      '16x16': 'https://via.placeholder.com/16',
      '32x32': 'https://via.placeholder.com/32',
    },
    self: 'https://jira.example.com/rest/api/2/user?username=jane.smith',
  },
  {
    name: 'bob.jones',
    displayName: 'Bob Jones',
    avatarUrls: {
      '16x16': 'https://via.placeholder.com/16',
      '32x32': 'https://via.placeholder.com/32',
    },
    self: 'https://jira.example.com/rest/api/2/user?username=bob.jones',
  },
  {
    name: 'alice.wonder',
    displayName: 'Alice Wonderland',
    avatarUrls: {
      '16x16': 'https://via.placeholder.com/16',
      '32x32': 'https://via.placeholder.com/32',
    },
    self: 'https://jira.example.com/rest/api/2/user?username=alice.wonder',
  },
  {
    name: 'charlie.brown',
    displayName: 'Charlie Brown',
    avatarUrls: {
      '16x16': 'https://via.placeholder.com/16',
      '32x32': 'https://via.placeholder.com/32',
    },
    self: 'https://jira.example.com/rest/api/2/user?username=charlie.brown',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockSearchUsers = async (query: string): Promise<JiraUser[]> => {
  await delay(500);
  return mockUsers.filter(
    u => u.name.toLowerCase().includes(query.toLowerCase()) || u.displayName.toLowerCase().includes(query.toLowerCase())
  );
};

const SelectWrapper: React.FC<{
  searchUsers: (query: string) => Promise<JiraUser[]>;
  initialValue?: SelectedPerson | null;
}> = ({ searchUsers, initialValue = null }) => {
  const [value, setValue] = useState<SelectedPerson | null>(initialValue);
  return (
    <div style={{ width: 400 }}>
      <PersonNameSelect searchUsers={searchUsers} value={value} onChange={setValue} />
      <pre style={{ marginTop: 16, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export const Default: Story = {
  render: () => <SelectWrapper searchUsers={mockSearchUsers} />,
};

export const WithSelectedUser: Story = {
  render: () => (
    <SelectWrapper
      searchUsers={mockSearchUsers}
      initialValue={{
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
      }}
    />
  ),
};

export const Loading: Story = {
  render: () => <SelectWrapper searchUsers={() => new Promise(() => {})} />,
};

export const NoResults: Story = {
  render: () => (
    <SelectWrapper
      searchUsers={async () => {
        await delay(300);
        return [];
      }}
    />
  ),
};

export const ApiError: Story = {
  render: () => (
    <SelectWrapper
      searchUsers={async () => {
        await delay(300);
        throw new Error('Network error');
      }}
    />
  ),
};

export const MultipleResults: Story = {
  render: () => (
    <SelectWrapper
      searchUsers={async () => {
        await delay(300);
        return mockUsers;
      }}
    />
  ),
};
