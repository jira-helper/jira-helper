/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken, searchUsersToken } from 'src/shared/di/jiraApiTokens';
import { clearIssueTypesCache } from 'src/shared/utils/issueTypeSelector';
import { PersonalWipLimitContainer } from '../components/PersonalWipLimitContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import { createPersonLimit, updatePersonLimit } from '../actions';
import type { PersonLimit, FormData } from '../state/types';
import type { JiraUser } from '../../../shared/jiraApi';

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

export const createLimit = (
  id: number,
  name: string,
  displayName: string,
  limit: number,
  cols: Array<{ id: string; name: string }> = [],
  swims: Array<{ id: string; name: string }> = []
): PersonLimit => ({
  id,
  person: { name, displayName, self: '', avatar: '' },
  limit,
  columns: cols,
  swimlanes: swims,
});

export const mockSearchUsers = async (query: string): Promise<JiraUser[]> => {
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
        avatarUrls: { '16x16': '', '32x32': '' },
        self: `https://jira.example.com/rest/api/2/user?username=${user.name}`,
      },
    ];
  }
  return [
    {
      name: query,
      displayName: query,
      avatarUrls: { '16x16': '', '32x32': '' },
      self: `https://jira.example.com/rest/api/2/user?username=${query}`,
    },
  ];
};

// --- Background setup ---

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);

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
  clearIssueTypesCache();
};

// --- Mount helpers ---

export const mountComponent = () => {
  const handleAddLimit = (formData: FormData) => {
    const store = useSettingsUIStore.getState();
    if (store.data.editingId !== null) {
      const existingLimit = store.data.limits.find(l => l.id === store.data.editingId);
      if (!existingLimit) return;
      const updatedLimit = updatePersonLimit({ existingLimit, formData, columns, swimlanes });
      store.actions.updateLimit(store.data.editingId, updatedLimit);
    } else {
      if (!formData.person) return;
      const personLimit = createPersonLimit({
        formData,
        person: {
          name: formData.person.name,
          displayName: formData.person.displayName,
          self: formData.person.self,
          avatar: formData.person.avatar,
        },
        columns,
        swimlanes,
        id: Date.now(),
      });
      store.actions.addLimit(personLimit);
    }
  };
  cy.mount(
    <PersonalWipLimitContainer
      columns={columns}
      swimlanes={swimlanes}
      searchUsers={mockSearchUsers}
      onAddLimit={handleAddLimit}
    />
  );
};

export const setupIssueTypesMock = () => {
  cy.intercept('GET', '**/rest/api/2/project/**', {
    body: {
      issueTypes: [
        { id: '1', name: 'Task', subtask: false },
        { id: '2', name: 'Bug', subtask: false },
        { id: '3', name: 'Story', subtask: false },
      ],
    },
  }).as('loadIssueTypes');
};

export const selectIssueTypes = (...types: string[]) => {
  cy.get('#project-input-person-limit-form').type('TEST');
  cy.contains('Issue types from project', { timeout: 3000 }).should('be.visible');
  types.forEach(type => {
    cy.get(`input[type="checkbox"][value="${type}"]`).check();
  });
};

export { PersonLimit, FormData, JiraUser };
