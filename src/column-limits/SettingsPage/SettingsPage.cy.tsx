/// <reference types="cypress" />
/**
 * Cypress Component Tests for Column Group WIP Limit Settings
 *
 * Tests match settings-page.feature scenarios
 */
import React from 'react';
import { SettingsModalContainer } from './components/SettingsModal/SettingsModalContainer';
import { useColumnLimitsSettingsUIStore } from './stores/settingsUIStore';
import { WITHOUT_GROUP_ID } from '../types';
import type { Column } from '../types';

describe('Feature: Group Column WIP Limits Settings', () => {
  let onClose: Cypress.Agent<sinon.SinonStub>;
  let onSave: Cypress.Agent<sinon.SinonStub>;

  const columns: Column[] = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
    { id: 'col3', name: 'Review' },
    { id: 'col4', name: 'Done' },
  ];

  beforeEach(() => {
    // Ensure store is reset before each test
    useColumnLimitsSettingsUIStore.getState().actions.reset();
    onClose = cy.stub().as('onClose');
    onSave = cy.stub().resolves().as('onSave');
  });

  const mountComponent = () => {
    cy.mount(<SettingsModalContainer onClose={onClose} onSave={onSave} />);
  };

  // === SC1: MODAL CANCEL ===

  describe('SC1: Cancel button closes the modal', () => {
    it('should call onClose when Cancel is clicked', () => {
      mountComponent();
      cy.contains('button', 'Cancel').click();
      cy.get('@onClose').should('have.been.called');
    });
  });

  // === DRAG AND DROP ===

  describe('Drag and Drop Scenarios', () => {
    beforeEach(() => {
      // Setup initial data in store
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: columns,
        groups: [],
      });
    });

    it('SC2: Move column from "Without Group" to existing group', () => {
      // Setup existing group via store
      cy.then(() => {
        useColumnLimitsSettingsUIStore.getState().actions.setGroups([{ id: 'group-1', columns: [], max: 5 }]);
      });

      mountComponent();

      // Drag "In Progress" to "group-1" dropzone
      cy.drag('[data-column-id="col2"]', '.dropzone-jh[data-group-id="group-1"]');

      // Verify in DOM
      cy.get('.dropzone-jh[data-group-id="group-1"]').find('[data-column-id="col2"]').should('exist');
    });

    it('SC3: Move column from one group to another', () => {
      // Setup two groups via store
      cy.then(() => {
        useColumnLimitsSettingsUIStore.getState().actions.setData({
          withoutGroupColumns: [],
          groups: [
            { id: 'group-a', columns: [{ id: 'col2', name: 'In Progress' }], max: 5 },
            { id: 'group-b', columns: [], max: 3 },
          ],
        });
      });

      mountComponent();

      // Drag from Group A to Group B dropzone
      cy.drag('[data-column-id="col2"]', '.dropzone-jh[data-group-id="group-b"]');

      // Verify
      cy.get('.dropzone-jh[data-group-id="group-b"]').find('[data-column-id="col2"]').should('exist');
      cy.get('[data-group-id="group-a"]').should('not.exist');
    });

    it('SC4: Create new group by dragging column to dropzone', () => {
      mountComponent();

      // Drag "Review" to "Create new group" dropzone
      cy.drag('[data-column-id="col3"]', '#jh-column-dropzone');

      // Verify a new group exists
      cy.get('.group-limits-input-jh').should('have.length', 1);
      cy.get('[data-column-id="col3"]')
        .closest('[data-group-id]')
        .should('not.have.attr', 'data-group-id', WITHOUT_GROUP_ID);
    });

    it('SC5: Move column back to "Without Group"', () => {
      // Setup group with column via store
      cy.then(() => {
        useColumnLimitsSettingsUIStore.getState().actions.setData({
          withoutGroupColumns: [],
          groups: [{ id: 'group-1', columns: [{ id: 'col4', name: 'Done' }], max: 5 }],
        });
      });

      mountComponent();

      // Drag back to Without Group
      cy.drag('[data-column-id="col4"]', `[data-group-id="${WITHOUT_GROUP_ID}"]`);

      // Verify
      cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`).find('[data-column-id="col4"]').should('exist');
    });

    it('SC6: Dropzone highlights on drag over', () => {
      mountComponent();

      // Trigger dragover
      cy.get('[data-column-id="col1"]').first().trigger('dragstart', { dataTransfer: new DataTransfer() });
      cy.get('#jh-column-dropzone').trigger('dragover');

      // Check for active class part
      cy.get('#jh-column-dropzone')
        .invoke('attr', 'class')
        .should('match', /ActiveJH/);

      cy.get('#jh-column-dropzone').trigger('dragleave');
      cy.get('#jh-column-dropzone')
        .invoke('attr', 'class')
        .should('not.match', /ActiveJH/);
    });
  });
});
