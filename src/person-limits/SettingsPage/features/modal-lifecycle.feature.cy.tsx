/// <reference types="cypress" />
/**
 * Cypress Component Tests: Modal Lifecycle
 * Scenarios: SC-MODAL-1, SC-MODAL-2
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import React from 'react';
import { usePersonWipLimitsPropertyStore } from 'src/person-limits/property/store';
import { SettingsButtonContainer } from '../components/SettingsButton/SettingsButtonContainer';
import { Scenario, Step } from '../../../../cypress/support/bdd';
import {
  columns,
  swimlanes,
  mockSearchUsers,
  createLimit,
  setupBackground,
  type PersonLimit,
} from './helpers';

describe('Feature: Personal WIP Limit Settings — Modal Lifecycle', () => {
  beforeEach(() => {
    setupBackground();
  });

  Scenario('SC-MODAL-1: Open modal with empty state and default form values', () => {
    Step('Given there are no limits configured', () => {
      usePersonWipLimitsPropertyStore.getState().actions.reset();
    });

    Step('When I click "Manage per-person WIP-limits" button', () => {
      cy.mount(
        <SettingsButtonContainer
          boardDataColumns={columns}
          boardDataSwimlanes={swimlanes}
          searchUsers={mockSearchUsers}
        />
      );
      cy.contains('button', 'Manage per-person WIP-limits').click();
      cy.get('[role="dialog"]').should('exist');
    });

    Step('Then I should see the Personal WIP Limits modal', () => {
      cy.contains('Personal WIP Limit').scrollIntoView().should('be.visible');
      cy.get('[role="dialog"]').scrollIntoView().should('be.visible');
    });

    Step('And I should see an empty limits table', () => {
      cy.get('#edit-person-wip-limit-persons-limit-body').should('exist');
      cy.get('#edit-person-wip-limit-persons-limit-body .ant-table-row').should('not.exist');
    });

    Step('And I should see the avatar warning message', () => {
      cy.contains('To work correctly').should('be.visible');
    });

    Step('And the person name select should be empty', () => {
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-select')
        .find('.ant-select-selection-item')
        .should('not.exist');
    });

    Step('And the limit field should show value 1', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '1');
    });

    Step('And "All columns" checkbox should be checked', () => {
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
    });

    Step('And "All swimlanes" checkbox should be checked', () => {
      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
    });

    Step('And "Count all issue types" checkbox should be checked', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
    });

    Step('When I click "Save"', () => {
      cy.contains('button', 'Save').click();
    });

    Step('Then the modal should be closed', () => {
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  Scenario('SC-MODAL-2: Open modal with pre-configured limits', () => {
    Step('Given there is a limit for "alice" (Alice Smith) with value 3 for all columns and all swimlanes', () => {
      const aliceLimit = createLimit(1, 'alice', 'Alice Smith', 3, [], []);
      usePersonWipLimitsPropertyStore.getState().actions.setLimits([aliceLimit]);
    });

    Step('And there is a limit for "bob" (Bob Johnson) with value 5 for columns "To Do, In Progress" only', () => {
      const bobLimit = createLimit(2, 'bob', 'Bob Johnson', 5, [
        { id: 'col1', name: 'To Do' },
        { id: 'col2', name: 'In Progress' },
      ]);
      usePersonWipLimitsPropertyStore
        .getState()
        .actions.setLimits([...usePersonWipLimitsPropertyStore.getState().data.limits, bobLimit]);
    });

    Step('And there is a limit for "charlie" (Charlie Brown) with value 2 for swimlane "Frontend" only', () => {
      const charlieLimit = createLimit(3, 'charlie', 'Charlie Brown', 2, [], [{ id: 'swim1', name: 'Frontend' }]);
      usePersonWipLimitsPropertyStore
        .getState()
        .actions.setLimits([...usePersonWipLimitsPropertyStore.getState().data.limits, charlieLimit]);
    });

    Step('And there is a limit for "diana" (Diana Prince) with value 4 for issue types "Task, Bug" only', () => {
      const dianaLimit: PersonLimit = {
        ...createLimit(4, 'diana', 'Diana Prince', 4),
        includedIssueTypes: ['Task', 'Bug'],
      };
      usePersonWipLimitsPropertyStore
        .getState()
        .actions.setLimits([...usePersonWipLimitsPropertyStore.getState().data.limits, dianaLimit]);
    });

    Step(
      'And there is a limit for "eve" (Eve Wilson) with value 6 for columns "In Progress", swimlane "Backend" and issue types "Story"',
      () => {
        const eveLimit: PersonLimit = {
          ...createLimit(
            5,
            'eve',
            'Eve Wilson',
            6,
            [{ id: 'col2', name: 'In Progress' }],
            [{ id: 'swim2', name: 'Backend' }]
          ),
          includedIssueTypes: ['Story'],
        };
        usePersonWipLimitsPropertyStore
          .getState()
          .actions.setLimits([...usePersonWipLimitsPropertyStore.getState().data.limits, eveLimit]);
      }
    );

    Step('When I click "Manage per-person WIP-limits" button', () => {
      cy.mount(
        <SettingsButtonContainer
          boardDataColumns={columns}
          boardDataSwimlanes={swimlanes}
          searchUsers={mockSearchUsers}
        />
      );
      cy.contains('button', 'Manage per-person WIP-limits').click();
    });

    Step('Then I should see the Personal WIP Limits modal', () => {
      cy.contains('Personal WIP Limit').scrollIntoView().should('be.visible');
      cy.get('[role="dialog"]').scrollIntoView().should('be.visible');
    });

    Step('And I should see 5 limits in the table', () => {
      cy.get('#edit-person-wip-limit-persons-limit-body .ant-table-tbody tr.ant-table-row').should('have.length', 5);
    });

    Step(
      'And I should see limit for "Alice Smith" with value 3 and "All" columns, "All" swimlanes and "All" issue types',
      () => {
        cy.contains('tr', 'Alice Smith').within(() => {
          cy.contains('3').should('be.visible');
          cy.get('td').eq(2).should('have.text', 'All'); // Columns
          cy.get('td').eq(3).should('have.text', 'All'); // Swimlanes
          cy.get('td').eq(4).should('have.text', 'All'); // Issue types
        });
      }
    );

    Step('And I should see limit for "Bob Johnson" with value 5 and columns "To Do, In Progress"', () => {
      cy.contains('tr', 'Bob Johnson').within(() => {
        cy.contains('5').should('be.visible');
        cy.contains('To Do, In Progress').should('be.visible');
      });
    });

    Step('And I should see limit for "Charlie Brown" with value 2 and swimlane "Frontend"', () => {
      cy.contains('tr', 'Charlie Brown').within(() => {
        cy.contains('2').should('be.visible');
        cy.contains('Frontend').should('be.visible');
      });
    });

    Step('And I should see limit for "Diana Prince" with value 4 and issue types "Task, Bug"', () => {
      cy.contains('tr', 'Diana Prince')
        .scrollIntoView()
        .within(() => {
          cy.contains('4').should('be.visible');
          cy.contains('Task, Bug').should('be.visible');
        });
    });

    Step(
      'And I should see limit for "Eve Wilson" with value 6, column "In Progress", swimlane "Backend" and issue types "Story"',
      () => {
        cy.contains('tr', 'Eve Wilson')
          .scrollIntoView()
          .within(() => {
            cy.contains('6').should('be.visible');
            cy.contains('In Progress').should('be.visible');
            cy.contains('Backend').should('be.visible');
            cy.contains('Story').should('be.visible');
          });
      }
    );

    Step('When I click "Cancel"', () => {
      cy.contains('button', 'Cancel').click();
    });

    Step('Then the modal should be closed', () => {
      cy.get('[role="dialog"]').should('not.exist');
    });
  });
});
