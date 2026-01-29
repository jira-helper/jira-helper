import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PersonalWipLimitTable } from './PersonalWipLimitTable';
import type { PersonLimit } from '../state/types';

const meta: Meta<typeof PersonalWipLimitTable> = {
  title: 'WIP Limits/PersonalWipLimitTable',
  component: PersonalWipLimitTable,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PersonalWipLimitTable>;

const mockLimits: PersonLimit[] = [
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
    columns: [], // empty = all columns (should display "All")
    swimlanes: [], // empty = all swimlanes (should display "All")
  },
  {
    id: 3,
    person: {
      name: 'bob.jones',
      displayName: 'Bob Jones',
      self: 'https://jira.example.com/user',
      avatar: 'https://via.placeholder.com/32',
    },
    limit: 2,
    columns: [
      { id: 'col1', name: 'To Do' },
      { id: 'col2', name: 'In Progress' },
    ],
    swimlanes: [{ id: 'swim1', name: 'Frontend' }],
  },
];

export const EmptyState: Story = {
  render: () => (
    <PersonalWipLimitTable
      limits={[]}
      checkedIds={[]}
      onDelete={() => {}}
      onEdit={() => {}}
      onCheckboxChange={() => {}}
    />
  ),
};

export const WithLimits: Story = {
  render: () => (
    <PersonalWipLimitTable
      limits={mockLimits}
      checkedIds={[]}
      onDelete={() => {}}
      onEdit={() => {}}
      onCheckboxChange={() => {}}
    />
  ),
};

export const WithAllColumnsAndSwimlanes: Story = {
  render: () => {
    const limitWithAll: PersonLimit = {
      id: 1,
      person: {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/user',
        avatar: 'https://via.placeholder.com/32',
      },
      limit: 5,
      columns: [], // should display "All"
      swimlanes: [], // should display "All"
    };

    return (
      <PersonalWipLimitTable
        limits={[limitWithAll]}
        checkedIds={[]}
        onDelete={() => {}}
        onEdit={() => {}}
        onCheckboxChange={() => {}}
      />
    );
  },
};

export const WithSelectedRows: Story = {
  render: () => (
    <PersonalWipLimitTable
      limits={mockLimits}
      checkedIds={[1, 2]}
      onDelete={() => {}}
      onEdit={() => {}}
      onCheckboxChange={() => {}}
    />
  ),
};
