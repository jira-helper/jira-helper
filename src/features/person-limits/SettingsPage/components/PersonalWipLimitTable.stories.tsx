import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PersonalWipLimitTable } from './PersonalWipLimitTable';
import type { PersonLimit } from '../state/types';
import { PERSON_LIMITS_TEXTS } from '../texts';

// Mock texts for storybook (using English)
const mockTexts = Object.fromEntries(
  Object.entries(PERSON_LIMITS_TEXTS).map(([key, value]) => [key, value.en])
) as Record<keyof typeof PERSON_LIMITS_TEXTS, string>;

const meta: Meta<typeof PersonalWipLimitTable> = {
  title: 'PersonLimits/SettingsPage/PersonalWipLimitTable',
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
    showAllPersonIssues: true,
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
    showAllPersonIssues: true,
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
    showAllPersonIssues: true,
  },
];

export const EmptyState: Story = {
  render: () => <PersonalWipLimitTable texts={mockTexts} limits={[]} onDelete={() => {}} onEdit={() => {}} />,
};

export const WithLimits: Story = {
  render: () => <PersonalWipLimitTable texts={mockTexts} limits={mockLimits} onDelete={() => {}} onEdit={() => {}} />,
};

export const WithMixedShowAllPersonIssues: Story = {
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
        showAllPersonIssues: true,
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
        showAllPersonIssues: false,
      },
    ];

    return <PersonalWipLimitTable texts={mockTexts} limits={limits} onDelete={() => {}} onEdit={() => {}} />;
  },
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
      showAllPersonIssues: true,
    };

    return <PersonalWipLimitTable texts={mockTexts} limits={[limitWithAll]} onDelete={() => {}} onEdit={() => {}} />;
  },
};
