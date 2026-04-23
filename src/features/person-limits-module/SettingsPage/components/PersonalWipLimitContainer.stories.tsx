import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JiraUser } from 'src/infrastructure/jira/jiraApi';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { routingServiceToken, type IRoutingService } from 'src/infrastructure/routing';
import { issueTypeServiceToken, type IIssueTypeService } from 'src/shared/issueType';
import { BoardPropertyServiceToken, type BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { PersonalWipLimitContainer } from './PersonalWipLimitContainer';
import type { PersonLimit } from '../../property/types';
import { personLimitsModule } from '../../module';
import { propertyModelToken, settingsUIModelToken } from '../../tokens';

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

function initContainerStoryDi(initialLimits: PersonLimit[]) {
  globalContainer.reset();
  registerLogger(globalContainer);
  globalContainer.register({ token: localeProviderToken, value: new MockLocaleProvider('en') });
  globalContainer.register({
    token: routingServiceToken,
    value: { getProjectKeyFromURL: () => 'TEST' } as unknown as IRoutingService,
  });
  globalContainer.register({
    token: issueTypeServiceToken,
    value: { loadForProject: async () => [], clearCache: () => {} } as IIssueTypeService,
  });
  globalContainer.register({
    token: BoardPropertyServiceToken,
    value: {
      getBoardProperty: async () => ({ limits: [] }),
      updateBoardProperty: () => {},
      deleteBoardProperty: () => {},
    } as unknown as BoardPropertyServiceI,
  });
  personLimitsModule.ensure(globalContainer);
  globalContainer.inject(propertyModelToken).model.setData({ limits: structuredClone(initialLimits) });
  globalContainer.inject(settingsUIModelToken).model.initFromProperty();
}

const ContainerView: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WithDi container={globalContainer}>{children}</WithDi>
);

const meta: Meta<typeof PersonalWipLimitContainer> = {
  title: 'PersonLimitsModule/SettingsPage/PersonalWipLimitContainer',
  component: PersonalWipLimitContainer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PersonalWipLimitContainer>;

export const EmptyState: Story = {
  loaders: [() => initContainerStoryDi([])],
  render: () => (
    <ContainerView>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerView>
  ),
};

export const AddMode: Story = {
  loaders: [() => initContainerStoryDi([])],
  render: () => (
    <ContainerView>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerView>
  ),
};

const singleLimit: PersonLimit = {
  id: 1,
  persons: [
    {
      name: 'john.doe',
      displayName: 'John Doe',
      self: 'https://jira.example.com/user',
    },
  ],
  limit: 5,
  columns: [{ id: 'col1', name: 'To Do' }],
  swimlanes: [{ id: 'swim1', name: 'Frontend' }],
  showAllPersonIssues: true,
};

export const EditMode: Story = {
  loaders: [() => initContainerStoryDi([singleLimit])],
  render: () => (
    <ContainerView>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerView>
  ),
  play: async ({ canvasElement }) => {
    const editButton = canvasElement.querySelector('[data-testid="edit-button-1"]') as HTMLElement;
    if (editButton) {
      editButton.click();
    }
  },
};

export const EditModeWithAllColumns: Story = {
  loaders: [() => initContainerStoryDi([{ ...singleLimit, columns: [], swimlanes: [] }])],
  render: () => (
    <ContainerView>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerView>
  ),
  play: async ({ canvasElement }) => {
    const editButton = canvasElement.querySelector('[data-testid="edit-button-1"]') as HTMLElement;
    if (editButton) {
      editButton.click();
    }
  },
};

export const EditModeShowAllDisabled: Story = {
  loaders: [() => initContainerStoryDi([{ ...singleLimit, showAllPersonIssues: false }])],
  render: () => (
    <ContainerView>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerView>
  ),
  play: async ({ canvasElement }) => {
    const editButton = canvasElement.querySelector('[data-testid="edit-button-1"]') as HTMLElement;
    if (editButton) {
      editButton.click();
    }
  },
};

export const WithMultipleLimits: Story = {
  loaders: [
    () =>
      initContainerStoryDi([
        {
          id: 1,
          persons: [
            {
              name: 'john.doe',
              displayName: 'John Doe',
              self: 'https://jira.example.com/user',
            },
          ],
          limit: 3,
          columns: [{ id: 'col1', name: 'To Do' }],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
          showAllPersonIssues: true,
        },
        {
          id: 2,
          persons: [
            {
              name: 'jane.smith',
              displayName: 'Jane Smith',
              self: 'https://jira.example.com/user',
            },
          ],
          limit: 5,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
        },
      ]),
  ],
  render: () => (
    <ContainerView>
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        searchUsers={mockSearchUsers}
        onAddLimit={async () => {}}
      />
    </ContainerView>
  ),
};
