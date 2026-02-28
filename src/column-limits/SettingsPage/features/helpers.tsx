/// <reference types="cypress" />
/**
 * @module column-limits/SettingsPage/features/helpers
 *
 * Test helpers for Column Limits SettingsPage BDD tests.
 * Provides fixtures, setup functions, and mount helpers.
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken, getProjectIssueTypesToken } from 'src/shared/di/jiraApiTokens';
import { Ok } from 'ts-results';
import { clearIssueTypesCache } from 'src/shared/utils/issueTypeSelector';
import { SettingsModalContainer } from '../components/SettingsModal/SettingsModalContainer';
import { SettingsButtonContainer } from '../components/SettingsButton/SettingsButtonContainer';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';
import { useColumnLimitsPropertyStore } from '../../property/store';
import type { Column } from '../../types';

// --- Test fixtures matching feature Background ---

export const columns: Column[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

export const issueTypes = [
  { id: '1', name: 'Task', subtask: false },
  { id: '2', name: 'Bug', subtask: false },
  { id: '3', name: 'Story', subtask: false },
];

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
    value: cy.stub().resolves().as('updateBoardProperty'),
  });

  globalContainer.register({
    token: getProjectIssueTypesToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value: async (_projectKey: string) => Ok(issueTypes),
  });

  useColumnLimitsSettingsUIStore.getState().actions.reset();
  useColumnLimitsPropertyStore.getState().actions.reset();
  clearIssueTypesCache();
};

// --- Mount helpers ---

export type ModalStubs = {
  onClose: Cypress.Agent<sinon.SinonStub>;
  onSave: Cypress.Agent<sinon.SinonStub>;
};

export const createModalStubs = (): ModalStubs => ({
  onClose: cy.stub().as('onClose'),
  onSave: cy.stub().resolves().as('onSave'),
});

export const mountModal = (stubs: ModalStubs) => {
  cy.mount(<SettingsModalContainer onClose={stubs.onClose} onSave={stubs.onSave} />);
};

export type ButtonStubs = {
  getColumns: Cypress.Agent<sinon.SinonStub>;
  getColumnName: Cypress.Agent<sinon.SinonStub>;
};

export const createButtonStubs = (): ButtonStubs => {
  const getColumns = cy.stub().returns(
    columns.map(col => {
      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-column-id', col.id);
      Object.defineProperty(mockElement, 'dataset', {
        value: { columnId: col.id },
        writable: false,
      });
      return mockElement;
    }) as NodeListOf<Element>
  );

  const getColumnName = cy.stub().callsFake((el: HTMLElement) => {
    const colId = el.dataset?.columnId || el.getAttribute?.('data-column-id');
    return columns.find(c => c.id === colId)?.name || '';
  });

  return { getColumns, getColumnName };
};

export const mountButton = (stubs: ButtonStubs) => {
  cy.mount(<SettingsButtonContainer getColumns={stubs.getColumns} getColumnName={stubs.getColumnName} />);
};

// Re-export types for convenience
export type { Column };
