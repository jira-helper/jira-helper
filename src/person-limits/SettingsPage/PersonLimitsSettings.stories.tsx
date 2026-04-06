import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { issueTypeServiceToken, type IIssueTypeService } from 'src/shared/issueType';
import { BoardPropertyServiceToken, type BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import { PersonalWipLimitContainer } from './components/PersonalWipLimitContainer';
import { personLimitsModule } from '../module';
import { propertyModelToken, settingsUIModelToken } from '../tokens';
import type { PersonLimit, Column, Swimlane } from './state/types';

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

function initPersonLimitsStoryDi(limits: PersonLimit[]) {
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
  globalContainer.inject(propertyModelToken).model.setData({ limits: structuredClone(limits) });
  globalContainer.inject(settingsUIModelToken).model.initFromProperty();
}

const PersonLimitsView: React.FC = () => (
  <WithDi container={globalContainer}>
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h2 style={{ marginBottom: '20px' }}>Personal WIP Limits Settings</h2>
      <PersonalWipLimitContainer
        columns={defaultColumns}
        swimlanes={defaultSwimlanes}
        onAddLimit={fn()}
        searchUsers={async () => []}
      />
    </div>
  </WithDi>
);

const meta: Meta = {
  title: 'PersonLimits/SettingsPage/PersonLimitsSettings',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const EmptyState: StoryObj = {
  loaders: [() => initPersonLimitsStoryDi([])],
  render: () => <PersonLimitsView />,
};

export const SingleLimit: StoryObj = {
  loaders: [
    () =>
      initPersonLimitsStoryDi([
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
          showAllPersonIssues: true,
        },
      ]),
  ],
  render: () => <PersonLimitsView />,
};

export const MultipleLimits: StoryObj = {
  loaders: [
    () =>
      initPersonLimitsStoryDi([
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
          showAllPersonIssues: true,
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
          showAllPersonIssues: true,
        },
      ]),
  ],
  render: () => <PersonLimitsView />,
};

export const WithShowAllDisabled: StoryObj = {
  loaders: [
    () =>
      initPersonLimitsStoryDi([
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
          showAllPersonIssues: false,
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
          showAllPersonIssues: true,
        },
      ]),
  ],
  render: () => <PersonLimitsView />,
};

export const WithIssueTypeFilter: StoryObj = {
  loaders: [
    () =>
      initPersonLimitsStoryDi([
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
          showAllPersonIssues: true,
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
          showAllPersonIssues: true,
        },
      ]),
  ],
  render: () => <PersonLimitsView />,
};
