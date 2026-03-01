import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PersonalWipLimitContainer } from './components/PersonalWipLimitContainer';
import { useSettingsUIStore } from './stores/settingsUIStore';
import type { PersonLimit, Column, Swimlane } from './state/types';

const meta: Meta = {
  title: 'WIP Limits/Person Limits Settings',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

interface PersonLimitsDemoProps {
  limits?: PersonLimit[];
}

const defaultColumns: Column[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Code Review' },
  { id: 'col4', name: 'Testing' },
  { id: 'col5', name: 'Done' },
];

const defaultSwimlanes: Swimlane[] = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
  { id: 'swim3', name: 'DevOps' },
];

const PersonLimitsDemo: React.FC<PersonLimitsDemoProps> = ({ limits = [] }) => {
  useEffect(() => {
    useSettingsUIStore.getState().actions.reset();
    if (limits.length > 0) {
      useSettingsUIStore.getState().actions.setData(limits);
    }
  }, [limits]);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h2 style={{ marginBottom: '20px' }}>Personal WIP Limits Settings</h2>
      <PersonalWipLimitContainer
        columns={defaultColumns}
        swimlanes={defaultSwimlanes}
        onAddLimit={fn()}
        searchUsers={async () => []}
      />
    </div>
  );
};

export const EmptyState: StoryObj = {
  render: () => <PersonLimitsDemo limits={[]} />,
};

export const SingleLimit: StoryObj = {
  render: () => (
    <PersonLimitsDemo
      limits={[
        {
          id: 1,
          person: {
            name: 'john.doe',
            displayName: 'John Doe',
            self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 3,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
        },
      ]}
    />
  ),
};

export const MultipleLimits: StoryObj = {
  render: () => (
    <PersonLimitsDemo
      limits={[
        {
          id: 1,
          person: {
            name: 'john.doe',
            displayName: 'John Doe',
            self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 3,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
        },
        {
          id: 2,
          person: {
            name: 'jane.smith',
            displayName: 'Jane Smith',
            self: 'https://jira.example.com/rest/api/2/user?username=jane.smith',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 5,
          columns: [
            { id: 'col2', name: 'In Progress' },
            { id: 'col3', name: 'Code Review' },
          ],
          swimlanes: [{ id: 'swim2', name: 'Backend' }],
        },
      ]}
    />
  ),
};

export const WithIssueTypeFilter: StoryObj = {
  render: () => (
    <PersonLimitsDemo
      limits={[
        {
          id: 1,
          person: {
            name: 'john.doe',
            displayName: 'John Doe',
            self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 3,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          id: 2,
          person: {
            name: 'jane.smith',
            displayName: 'Jane Smith',
            self: 'https://jira.example.com/rest/api/2/user?username=jane.smith',
            avatar: 'https://via.placeholder.com/32',
          },
          limit: 5,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim2', name: 'Backend' }],
          includedIssueTypes: ['Story', 'Epic'],
        },
      ]}
    />
  ),
};
