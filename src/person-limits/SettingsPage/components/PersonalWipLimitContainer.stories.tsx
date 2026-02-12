import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PersonalWipLimitContainer } from './PersonalWipLimitContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { PersonLimit } from '../../property/types';

const meta: Meta<typeof PersonalWipLimitContainer> = {
  title: 'WIP Limits/PersonalWipLimitContainer',
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

// Wrapper to reset store before each story
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
      <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={async () => {}} />
    </ContainerWrapper>
  ),
};

export const AddMode: Story = {
  render: () => (
    <ContainerWrapper>
      <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={async () => {}} />
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
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={async () => {}} />
      </ContainerWrapper>
    );
  },
  play: async ({ canvasElement }) => {
    // Auto-click edit button
    const editButton = canvasElement.querySelector('[data-testid="edit-button-1"]') as HTMLElement;
    if (editButton) {
      editButton.click();
    }
  },
};

export const EditModeWithAllColumns: Story = {
  render: () => {
    // Empty array means "all columns"
    const limit: PersonLimit = {
      id: 1,
      person: {
        name: 'john.doe',
        displayName: 'John Doe',
        self: 'https://jira.example.com/user',
        avatar: 'https://via.placeholder.com/32',
      },
      limit: 5,
      columns: [], // empty = all columns
      swimlanes: [], // empty = all swimlanes
    };

    return (
      <ContainerWrapper initialLimits={[limit]}>
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={async () => {}} />
      </ContainerWrapper>
    );
  },
  play: async ({ canvasElement }) => {
    // Auto-click edit button
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
        columns: [], // all columns
        swimlanes: [], // all swimlanes
      },
    ];

    return (
      <ContainerWrapper initialLimits={limits}>
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={async () => {}} />
      </ContainerWrapper>
    );
  },
};
