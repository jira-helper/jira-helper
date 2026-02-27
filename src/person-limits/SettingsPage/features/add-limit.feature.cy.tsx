/// <reference types="cypress" />
/**
 * Cypress Component Tests: Add Limit
 * Scenarios: SC-ADD-1 through SC-ADD-10
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import { useSettingsUIStore } from '../stores/settingsUIStore';
import { Scenario, Step } from '../../../../cypress/support/bdd';
import {
  createLimit,
  setupBackground,
  mountComponent,
  setupIssueTypesMock,
  selectIssueTypes,
  type PersonLimit,
} from './helpers';

describe('Feature: Personal WIP Limit Settings — Add Limit', () => {
  beforeEach(() => {
    setupBackground();
  });

  // === Basic ===

  Scenario('SC-ADD-1: Add a new limit for a person', () => {
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 5', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('5');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see "John Doe" in the limits list', () => {
      cy.contains('tr', 'John Doe').should('be.visible');
    });

    Step('And the limit should show value 5', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.contains('5').should('be.visible');
      });
    });

    Step(
      'And the form should be reset to default values (empty person name, limit 1, all columns, all swimlanes, all issue types)',
      () => {
        cy.get('#edit-person-wip-limit-person-name')
          .closest('.ant-select')
          .find('.ant-select-selection-item')
          .should('not.exist');
        cy.get('#edit-person-wip-limit-person-limit').should('have.value', '1');
        cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
        cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
      }
    );
  });

  // === Column filtering ===

  Scenario('SC-ADD-2: Add a limit for specific columns only', () => {
    mountComponent();

    Step('When I search for "jane" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('jane', { force: true });
    });

    Step('And I select "Jane Doe (jane.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 3', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('3');
    });

    Step('And I select only columns "To Do, In Progress"', () => {
      cy.contains('label', 'All columns').click();
      cy.contains('label', 'Done').click();
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then the limit for "Jane Doe" should apply only to "To Do, In Progress"', () => {
      cy.contains('tr', 'Jane Doe').within(() => {
        cy.contains('To Do, In Progress').should('be.visible');
      });
    });
  });

  // === Swimlane filtering ===

  Scenario('SC-ADD-3: Add a limit for specific swimlanes only', () => {
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 5', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('5');
    });

    Step('And I select only swimlane "Frontend"', () => {
      cy.contains('label', 'All swimlanes').click();
      cy.contains('label', 'Backend').click();
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then the limit for "John Doe" should apply only to swimlane "Frontend"', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.contains('Frontend').should('be.visible');
      });
    });
  });

  // === Issue type filtering ===

  Scenario('SC-ADD-4: Add a limit for specific issue types only', () => {
    setupIssueTypesMock();
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 3', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('3');
    });

    Step('And I uncheck "Count all issue types"', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').uncheck();
    });

    Step('And I select issue types "Task, Bug"', () => {
      selectIssueTypes('Task', 'Bug');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then the limit for "John Doe" should count only "Task, Bug" issues', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.contains('Task, Bug').should('be.visible');
      });
    });

    Step(
      'And the form should be reset to default values (empty person name, all swimlanes, all columns, all issue types)',
      () => {
        cy.get('#edit-person-wip-limit-person-name')
          .closest('.ant-select')
          .find('.ant-select-selection-item')
          .should('not.exist');
        cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
        cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
      }
    );
  });

  // === Combined filters ===

  Scenario('SC-ADD-5: Add a limit with columns, swimlanes and issue types', () => {
    setupIssueTypesMock();
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 4', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('4');
    });

    Step('And I select only columns "In Progress"', () => {
      cy.contains('label', 'All columns').click();
      cy.contains('label', 'To Do').click();
      cy.contains('label', 'Done').click();
    });

    Step('And I select only swimlane "Backend"', () => {
      cy.contains('label', 'All swimlanes').click();
      cy.contains('label', 'Frontend').click();
    });

    Step('And I uncheck "Count all issue types"', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').uncheck();
    });

    Step('And I select issue types "Story"', () => {
      selectIssueTypes('Story');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step(
      'Then the limit for "John Doe" should apply to column "In Progress", swimlane "Backend" and issue types "Story"',
      () => {
        cy.contains('tr', 'John Doe').within(() => {
          cy.contains('In Progress').should('be.visible');
          cy.contains('Backend').should('be.visible');
          cy.contains('Story').should('be.visible');
        });
      }
    );
  });

  Scenario('SC-ADD-6: Add multiple limits for same person with different columns', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 3 for column "To Do"', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 3, [{ id: 'col1', name: 'To Do' }]);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 5', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('5');
    });

    Step('And I select only column "In Progress"', () => {
      cy.contains('label', 'All columns').click();
      cy.contains('label', 'To Do').click();
      cy.contains('label', 'Done').click();
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see two limits for "John Doe"', () => {
      cy.get('.ant-table-tbody tr').filter(':contains("John Doe")').should('have.length', 2);
    });

    Step('And one limit should show value 3 for "To Do"', () => {
      cy.get('.ant-table-tbody tr')
        .filter(':contains("To Do")')
        .within(() => {
          cy.contains('3').should('be.visible');
        });
    });

    Step('And another limit should show value 5 for "In Progress"', () => {
      cy.get('.ant-table-tbody tr')
        .filter(':contains("In Progress")')
        .within(() => {
          cy.contains('5').should('be.visible');
        });
    });
  });

  // === Validation ===

  Scenario('SC-ADD-7: Cannot add limit without selecting a person', () => {
    mountComponent();

    Step('When I set the limit to 5', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('5');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see a validation error for person name', () => {
      cy.get('.ant-form-item-has-error').should('exist');
    });

    Step('And the person name field should have error highlight', () => {
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error');
    });

    Step('And I should see error message "Select a person"', () => {
      cy.contains('Select a person').should('be.visible');
    });

    // eslint-disable-next-line quotes
    Step("And I don't see new limit in the table", () => {
      cy.get('.ant-table-tbody .ant-table-row').should('not.exist');
    });
  });

  Scenario('SC-ADD-8: Cannot add limit with zero value', () => {
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 0', () => {
      cy.get('#edit-person-wip-limit-person-limit').type('{selectall}0').blur();
    });

    Step('Then I see 1 in input', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '1');
    });
  });

  Scenario('SC-ADD-9: Cannot add duplicate limit', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [], []);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 3', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('3');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see a validation error for duplicate limit', () => {
      cy.contains('A limit with the same filters already exists for this person').should('be.visible');
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error');
    });

    Step('And the limit should not be added to the list', () => {
      cy.get('#edit-person-wip-limit-persons-limit-body .ant-table-tbody tr').should('have.length', 1);
    });

    Step('And the existing limit for "John Doe" should still show value 5', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.contains('5').should('be.visible');
      });
    });

    Step('And there is only 1 limit for "John Doe"', () => {
      cy.get('.ant-table-tbody tr').filter(':contains("John Doe")').should('have.length', 1);
    });
  });

  Scenario('SC-ADD-9a: Cannot add duplicate limit with same issue types', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for issue types "Task, Bug"', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 'John Doe', 5),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    setupIssueTypesMock();
    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 3', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('3');
    });

    Step('And I uncheck "Count all issue types"', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').uncheck();
    });

    Step('And I select issue types "Task, Bug"', () => {
      selectIssueTypes('Task', 'Bug');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see a validation error for duplicate limit', () => {
      cy.contains('A limit with the same filters already exists for this person').should('be.visible');
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error');
    });

    Step('And there is only 1 limit for "John Doe"', () => {
      cy.get('.ant-table-tbody tr').filter(':contains("John Doe")').should('have.length', 1);
    });
  });

  Scenario('SC-ADD-10: Validation error clears when switching to edit mode', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [], []);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I search for "john" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('john', { force: true });
    });

    Step('And I select "John Doe (john.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I set the limit to 3', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('3');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see a validation error for duplicate limit', () => {
      cy.contains('A limit with the same filters already exists for this person').should('be.visible');
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-form-item')
        .should('have.class', 'ant-form-item-has-error');
    });

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('Then the person name field should not have error highlight', () => {
      cy.contains('button', 'Edit limit').should('be.visible');
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-form-item')
        .should('not.have.class', 'ant-form-item-has-error');
    });

    Step('And I should not see error message "A limit with the same filters already exists for this person"', () => {
      cy.contains('A limit with the same filters already exists for this person').should('not.exist');
    });
  });
});
