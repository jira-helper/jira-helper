/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken, searchUsersToken, getProjectIssueTypesToken } from 'src/shared/di/jiraApiTokens';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { Ok } from 'ts-results';
import { clearIssueTypesCache } from 'src/shared/utils/issueTypeSelector';
import { SettingsButtonContainer } from '../components/SettingsButton/SettingsButtonContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import { usePersonWipLimitsPropertyStore } from '../../property/store';
import type { JiraUser } from '../../../shared/jiraApi';

// --- Search mock configuration ---

type SearchMockType = 'default' | 'empty' | 'error';
let searchMockType: SearchMockType = 'default';

export const setSearchMockType = (type: SearchMockType) => {
  searchMockType = type;
};

const resetSearchMockType = () => {
  searchMockType = 'default';
};

// --- Fixtures matching feature Background ---

export const columns = [
  { id: 'col1', name: 'To Do', isKanPlanColumn: false },
  { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
  { id: 'col3', name: 'Done', isKanPlanColumn: false },
];

export const swimlanes = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
];

const mockSearchUsers = async (query: string): Promise<JiraUser[]> => {
  if (searchMockType === 'empty') {
    return [];
  }
  if (searchMockType === 'error') {
    throw new Error('API error');
  }

  const knownUsers: Record<string, { name: string; displayName: string }> = {
    john: { name: 'john.doe', displayName: 'John Doe' },
    'john.doe': { name: 'john.doe', displayName: 'John Doe' },
    jane: { name: 'jane.doe', displayName: 'Jane Doe' },
    'jane.doe': { name: 'jane.doe', displayName: 'Jane Doe' },
  };
  const user = knownUsers[query.toLowerCase()];
  if (user) {
    return [
      {
        name: user.name,
        displayName: user.displayName,
        avatarUrls: { '16x16': 'https://example.com/avatar.png', '32x32': 'https://example.com/avatar.png' },
        self: `https://jira.example.com/rest/api/2/user?username=${user.name}`,
      },
    ];
  }
  return [
    {
      name: query,
      displayName: query,
      avatarUrls: { '16x16': 'https://example.com/avatar.png', '32x32': 'https://example.com/avatar.png' },
      self: `https://jira.example.com/rest/api/2/user?username=${query}`,
    },
  ];
};

// --- Background setup ---

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);
  resetSearchMockType();

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });

  globalContainer.register({
    token: updateBoardPropertyToken,
    value: cy.stub().as('updateBoardProperty'),
  });

  globalContainer.register({
    token: searchUsersToken,
    value: mockSearchUsers,
  });

  useSettingsUIStore.getState().actions.reset();
  usePersonWipLimitsPropertyStore.getState().actions.reset();
  clearIssueTypesCache();

  // Mock issue types API via DI
  globalContainer.register({
    token: getProjectIssueTypesToken,
    value: async () =>
      Ok([
        { id: '1', name: 'Task', subtask: false },
        { id: '2', name: 'Bug', subtask: false },
        { id: '3', name: 'Story', subtask: false },
      ]),
  });

  globalContainer.register({
    token: routingServiceToken,
    value: { getProjectKeyFromURL: () => 'TEST' } as unknown as IRoutingService,
  });
};

// --- Mount helpers ---

export const mountSettingsButton = () => {
  cy.mount(
    <WithDi container={globalContainer}>
      <SettingsButtonContainer
        boardDataColumns={columns}
        boardDataSwimlanes={swimlanes}
        searchUsers={mockSearchUsers}
      />
    </WithDi>
  );
};
