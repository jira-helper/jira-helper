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
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { getBoardIdFromURLToken } from 'src/infrastructure/di/routingTokens';
import { updateBoardPropertyToken, getProjectIssueTypesToken } from 'src/infrastructure/di/jiraApiTokens';
import { routingServiceToken, type IRoutingService } from 'src/infrastructure/routing';
import { registerIssueTypeServiceInDI } from 'src/shared/issueType';
import { registerBoardPropertyServiceInDI } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, BoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { Ok } from 'ts-results';
import { SettingsButtonContainer } from '../components/SettingsButton/SettingsButtonContainer';
import { columnLimitsModule } from '../../module';
import { propertyModelToken, settingsUIModelToken } from '../../tokens';
import type { Column } from '../../types';

// --- Test fixtures matching feature Background ---

export const columns: Column[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

const issueTypes = [
  { id: '1', name: 'Task', subtask: false },
  { id: '2', name: 'Bug', subtask: false },
  { id: '3', name: 'Story', subtask: false },
];

/** Swimlanes for the board, set by "Given the board has swimlanes" step */
let boardSwimlanes: Array<{ id: string; name: string }> = [];

export const setBoardSwimlanes = (swimlanes: Array<{ id: string; name: string }>) => {
  boardSwimlanes = swimlanes;
};

const getBoardSwimlanes = () => boardSwimlanes;

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

  globalContainer.register({
    token: routingServiceToken,
    value: {
      getProjectKeyFromURL: () => 'TEST',
      getBoardIdFromURL: () => 'test-board-123',
    } as unknown as IRoutingService,
  });

  registerIssueTypeServiceInDI(globalContainer);

  globalContainer.register({
    token: boardPagePageObjectToken,
    value: BoardPagePageObject,
  });
  registerBoardPropertyServiceInDI(globalContainer);
  columnLimitsModule.ensure(globalContainer);

  globalContainer.inject(propertyModelToken).model.reset();
  globalContainer.inject(settingsUIModelToken).model.reset();
  boardSwimlanes = [];
};

// --- Mount helpers ---

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
