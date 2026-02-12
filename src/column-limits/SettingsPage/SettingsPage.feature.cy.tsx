/// <reference types="cypress" />
/**
 * Cypress Component Tests for Column Group WIP Limit Settings
 *
 * Tests match 1:1 with SettingsPage.feature scenarios.
 * Each Scenario/Step text MUST match the .feature file exactly.
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import React from 'react';
import { SettingsModalContainer } from './components/SettingsModal/SettingsModalContainer';
import { useColumnLimitsSettingsUIStore } from './stores/settingsUIStore';
import { WITHOUT_GROUP_ID } from '../types';
import type { Column } from '../types';
import { Scenario, Step } from '../../../cypress/support/bdd';

// --- Test fixtures matching feature Background ---

const columns: Column[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

// --- Feature ---

describe('Feature: Group Column WIP Limits Settings', () => {
  let onClose: Cypress.Agent<sinon.SinonStub>;
  let onSave: Cypress.Agent<sinon.SinonStub>;

  // Background
  beforeEach(() => {
    // Given I am on the Column WIP Limits settings page
    useColumnLimitsSettingsUIStore.getState().actions.reset();
    onClose = cy.stub().as('onClose');
    onSave = cy.stub().resolves().as('onSave');
    // And there are columns "To Do, In Progress, Review, Done" on the board
  });

  const mountComponent = () => {
    cy.mount(<SettingsModalContainer onClose={onClose} onSave={onSave} />);
  };

  // === MODAL CANCEL ===

  Scenario('SC1: Cancel button closes the modal without saving', () => {
    Step('Given I have opened the "Limits for groups" modal', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: columns,
        groups: [],
      });
    });

    Step('And I have made some changes to the group limits', () => {
      // Make changes: add a group and set limit
      cy.then(() => {
        useColumnLimitsSettingsUIStore
          .getState()
          .actions.setGroups([{ id: 'group-1', columns: [{ id: 'col2', name: 'In Progress' }], max: 5 }]);
      });
    });

    mountComponent();

    Step('When I click "Cancel"', () => {
      cy.contains('button', 'Cancel').click();
    });

    Step('Then the modal should close', () => {
      cy.get('@onClose').should('have.been.calledOnce');
    });

    Step('And the changes should not be saved', () => {
      cy.get('@onSave').should('not.have.been.called');
    });
  });

  // === DRAG AND DROP ===

  Scenario('SC2: Move column from "Without Group" to existing group', () => {
    Step('Given I have opened the "Limits for groups" modal', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: columns,
        groups: [],
      });
    });

    Step('And there is a column "In Progress" in "Without Group"', () => {
      // Already set in previous step
    });

    Step('And there is a group with limit 5', () => {
      cy.then(() => {
        useColumnLimitsSettingsUIStore.getState().actions.setGroups([{ id: 'group-1', columns: [], max: 5 }]);
      });
    });

    mountComponent();

    Step('When I drag "In Progress" column to the group', () => {
      cy.drag('[data-column-id="col2"]', '.dropzone-jh[data-group-id="group-1"]');
    });

    Step('Then "In Progress" should be in the group', () => {
      cy.get('.dropzone-jh[data-group-id="group-1"]').find('[data-column-id="col2"]').should('exist');
    });

    Step('And "In Progress" should not be in "Without Group"', () => {
      cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`).find('[data-column-id="col2"]').should('not.exist');
    });
  });

  Scenario('SC3: Move column from one group to another', () => {
    Step('Given I have opened the "Limits for groups" modal', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [],
        groups: [],
      });
    });

    Step('And there is a column "In Progress" in group "Group A"', () => {
      cy.then(() => {
        useColumnLimitsSettingsUIStore
          .getState()
          .actions.setGroups([{ id: 'group-a', columns: [{ id: 'col2', name: 'In Progress' }], max: 5 }]);
      });
    });

    Step('And there is a group "Group B" with limit 3', () => {
      cy.then(() => {
        const currentGroups = useColumnLimitsSettingsUIStore.getState().data.groups;
        useColumnLimitsSettingsUIStore
          .getState()
          .actions.setGroups([...currentGroups, { id: 'group-b', columns: [], max: 3 }]);
      });
    });

    mountComponent();

    Step('When I drag "In Progress" column from "Group A" to "Group B"', () => {
      cy.drag('[data-column-id="col2"]', '.dropzone-jh[data-group-id="group-b"]');
    });

    Step('Then "In Progress" should be in "Group B"', () => {
      cy.get('.dropzone-jh[data-group-id="group-b"]').find('[data-column-id="col2"]').should('exist');
    });

    Step('And "In Progress" should not be in "Group A"', () => {
      cy.then(() => {
        const groupA = useColumnLimitsSettingsUIStore.getState().data.groups.find(g => g.id === 'group-a');
        if (groupA) {
          const columnInGroupA = groupA.columns.find(c => c.id === 'col2');
          expect(columnInGroupA).to.equal(undefined);
        } else {
          // Group A was removed because it became empty
          expect(groupA).to.equal(undefined);
        }
      });
    });
  });

  Scenario('SC4: Create new group by dragging column to dropzone', () => {
    Step('Given I have opened the "Limits for groups" modal', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: columns,
        groups: [],
      });
    });

    Step('And there is a column "Review" in "Without Group"', () => {
      // Already set in previous step
    });

    mountComponent();

    Step('When I drag "Review" column to "Create new group" dropzone', () => {
      cy.drag('[data-column-id="col3"]', '#jh-column-dropzone');
    });

    Step('Then a new group should be created', () => {
      cy.get('.group-limits-input-jh').should('have.length', 1);
    });

    Step('And "Review" should be in the new group', () => {
      cy.get('[data-column-id="col3"]')
        .closest('[data-group-id]')
        .should('not.have.attr', 'data-group-id', WITHOUT_GROUP_ID);
    });
  });

  Scenario('SC5: Move column back to "Without Group"', () => {
    Step('Given I have opened the "Limits for groups" modal', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: [],
        groups: [],
      });
    });

    Step('And there is a column "Done" in a group', () => {
      cy.then(() => {
        useColumnLimitsSettingsUIStore
          .getState()
          .actions.setGroups([{ id: 'group-1', columns: [{ id: 'col4', name: 'Done' }], max: 5 }]);
      });
    });

    mountComponent();

    Step('When I drag "Done" column to "Without Group"', () => {
      cy.drag('[data-column-id="col4"]', `.dropzone-jh[data-group-id="${WITHOUT_GROUP_ID}"]`);
    });

    Step('Then "Done" should be in "Without Group"', () => {
      cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`).find('[data-column-id="col4"]').should('exist');
    });

    Step('And the group should not contain "Done"', () => {
      cy.then(() => {
        const group1 = useColumnLimitsSettingsUIStore.getState().data.groups.find(g => g.id === 'group-1');
        if (group1) {
          const columnInGroup1 = group1.columns.find(c => c.id === 'col4');
          expect(columnInGroup1).to.equal(undefined);
        } else {
          // Group was removed because it became empty
          expect(group1).to.equal(undefined);
        }
      });
    });
  });

  Scenario('SC6: Dropzone highlights on drag over', () => {
    Step('Given I have opened the "Limits for groups" modal', () => {
      useColumnLimitsSettingsUIStore.getState().actions.setData({
        withoutGroupColumns: columns,
        groups: [],
      });
    });

    mountComponent();

    Step('When I start dragging a column', () => {
      cy.get('[data-column-id="col1"]').first().trigger('dragstart', { dataTransfer: new DataTransfer() });
    });

    Step('And I hover over a dropzone', () => {
      cy.get('#jh-column-dropzone').trigger('dragover');
    });

    Step('Then the dropzone should be highlighted', () => {
      cy.get('#jh-column-dropzone')
        .invoke('attr', 'class')
        .should('match', /ActiveJH/);
    });
  });
});
