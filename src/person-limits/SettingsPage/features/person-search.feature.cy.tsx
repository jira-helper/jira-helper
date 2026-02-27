/// <reference types="cypress" />
/**
 * Cypress Component Tests: Person Search
 * Scenarios: SC-SEARCH-1 through SC-SEARCH-6
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import React from 'react';
import { PersonalWipLimitContainer } from '../components/PersonalWipLimitContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import { Scenario, Step } from '../../../../cypress/support/bdd';
import {
  columns,
  swimlanes,
  mockSearchUsers,
  createLimit,
  setupBackground,
  mountComponent,
  type JiraUser,
} from './helpers';

describe('Feature: Personal WIP Limit Settings — Person Search', () => {
  beforeEach(() => {
    setupBackground();
  });

  Scenario('SC-SEARCH-1: Search shows matching users with avatars', () => {
    mountComponent();

    Step('When I type "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('Then I should see a dropdown with matching users', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
    });

    Step('And each option should show avatar, display name and login', () => {
      cy.get('.ant-select-item-option')
        .first()
        .within(() => {
          cy.get('img').should('exist');
          cy.contains('John Doe').should('exist');
          cy.contains('john.doe').should('exist');
        });
    });
  });

  Scenario('SC-SEARCH-2: Search debounces API calls', () => {
    mountComponent();

    Step('When I type "j" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('j', { force: true });
    });

    Step('Then I should not see a dropdown (min 2 characters)', () => {
      cy.get('.ant-select-item-option').should('not.exist');
    });

    Step('When I type "jo" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').clear({ force: true }).type('jo', { force: true });
    });

    Step('Then I should see a loading indicator', () => {
      cy.get('.ant-select-dropdown .ant-spin', { timeout: 1000 }).should('exist');
    });

    Step('And then I should see search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
    });
  });

  Scenario('SC-SEARCH-3: No users found', () => {
    const emptySearchUsers = async (): Promise<JiraUser[]> => [];

    Step('When I search for "zzzznonexistent" in person name field', () => {
      cy.mount(
        <PersonalWipLimitContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={emptySearchUsers}
          onAddLimit={() => {}}
        />
      );
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('zzzznonexistent', { force: true });
    });

    Step('Then I should see "No users found" in the dropdown', () => {
      cy.contains('No users found', { timeout: 2000 }).should('be.visible');
    });
  });

  Scenario('SC-SEARCH-4: API error during search', () => {
    const failingSearchUsers = async (): Promise<JiraUser[]> => {
      throw new Error('API error');
    };

    Step('Given the user search API will fail', () => {
      cy.mount(
        <PersonalWipLimitContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={failingSearchUsers}
          onAddLimit={() => {}}
        />
      );
    });

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('Then I should see "Search failed, try again" in the dropdown', () => {
      cy.contains('Search failed, try again', { timeout: 2000 }).should('be.visible');
    });

    Step('And the form should remain functional', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('exist');
      cy.contains('button', 'Add limit').should('exist');
    });
  });

  Scenario('SC-SEARCH-5: Select user from search results', () => {
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('Then I should see "John Doe" as selected person', () => {
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-select')
        .find('.ant-select-selection-item')
        .should('contain.text', 'John Doe');
    });

    Step('And the limit form should be ready to submit', () => {
      cy.contains('button', 'Add limit').should('exist').and('be.visible');
    });
  });

  Scenario('SC-SEARCH-6: Edit mode shows current person in select', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('Then the person select should show "John Doe (john.doe)"', () => {
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-select')
        .find('.ant-select-selection-item')
        .should('contain.text', 'John Doe');
    });
  });
});
