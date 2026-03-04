/// <reference types="cypress" />
/// <reference types="sinon" />

/**
 * @module column-limits/SettingsPage/features/helpers
 *
 * Test helpers for Column Limits SettingsPage BDD tests.
 * Provides fixtures, setup functions, and mount helpers.
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
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

/** Swimlanes for the board, set by "Given the board has swimlanes" step */
let boardSwimlanes: Array<{ id: string; name: string }> = [];

export const setBoardSwimlanes = (swimlanes: Array<{ id: string; name: string }>) => {
  boardSwimlanes = swimlanes;
};

export const getBoardSwimlanes = () => boardSwimlanes;

// --- Background setup ---

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });

  const updateBoardPropertyStub = cy.stub().resolves();
  cy.wrap(updateBoardPropertyStub).as('updateBoardProperty');

  globalContainer.register({
    token: updateBoardPropertyToken,
    value: updateBoardPropertyStub,
  });

  globalContainer.register({
    token: getProjectIssueTypesToken,
    value: async () => Ok(issueTypes),
  });

  useColumnLimitsSettingsUIStore.getState().actions.reset();
  useColumnLimitsPropertyStore.getState().actions.reset();
  clearIssueTypesCache();
  boardSwimlanes = [];
};

// --- Mount helpers ---

export type ModalStubs = {
  onClose: sinon.SinonStub;
  onSave: sinon.SinonStub;
};

export const createModalStubs = (): ModalStubs => {
  const onClose = cy.stub();
  cy.wrap(onClose).as('onClose');
  const onSave = cy.stub().resolves();
  cy.wrap(onSave).as('onSave');
  return { onClose, onSave };
};

export const mountModal = (stubs: ModalStubs) => {
  cy.mount(
    <WithDi container={globalContainer}>
      <SettingsModalContainer onClose={stubs.onClose} onSave={stubs.onSave} />
    </WithDi>
  );
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
    }) as unknown as NodeListOf<Element>
  );

  const getColumnName = cy.stub().callsFake((el: HTMLElement) => {
    const colId = el.dataset?.columnId || el.getAttribute?.('data-column-id');
    return columns.find(c => c.id === colId)?.name || '';
  });

  return {
    getColumns: getColumns as Cypress.Agent<sinon.SinonStub>,
    getColumnName: getColumnName as Cypress.Agent<sinon.SinonStub>,
  };
};

export const mountButton = (stubs: ButtonStubs) => {
  const swimlanes = getBoardSwimlanes();

  cy.mount(
    <WithDi container={globalContainer}>
      <SettingsButtonContainer
        getColumns={stubs.getColumns}
        getColumnName={stubs.getColumnName}
        swimlanes={swimlanes}
      />
    </WithDi>
  );
};

// Re-export types for convenience
export type { Column };
