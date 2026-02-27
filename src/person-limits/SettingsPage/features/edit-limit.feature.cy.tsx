/// <reference types="cypress" />
/**
 * Cypress Component Tests: Edit Limit
 * Scenarios: SC-EDIT-1 through SC-EDIT-12
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

describe('Feature: Personal WIP Limit Settings — Edit Limit', () => {
  beforeEach(() => {
    setupBackground();
  });

  // === Basic ===

  Scenario('SC-EDIT-1: Edit shows current values', () => {
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

    Step('And I should see 5 in the limit field', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '5');
    });

    Step('And the button should show "Edit limit"', () => {
      cy.contains('button', 'Edit limit').should('be.visible');
    });
  });

  Scenario('SC-EDIT-2: Update limit value', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I change the limit to 10', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('10');
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step('Then the limit for "John Doe" should show value 10', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.contains('10').should('be.visible');
      });
    });
  });

  Scenario('SC-EDIT-3: Change person', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I search for "jane" in person name field', () => {
      cy.get('#edit-person-wip-limit-person-name')
        .closest('.ant-select')
        .find('.ant-select-clear')
        .click({ force: true });
      cy.get('#edit-person-wip-limit-person-name').closest('.ant-select').click();
      cy.get('#edit-person-wip-limit-person-name').type('jane', { force: true });
    });

    Step('And I select "Jane Doe (jane.doe)" from search results', () => {
      cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
      cy.get('.ant-select-item-option').first().click();
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step('Then I should see "Jane Doe" in the limits list', () => {
      cy.contains('tr', 'Jane Doe').should('be.visible');
    });

    Step('And "John Doe" should not be in the limits list', () => {
      cy.get('.ant-table-tbody').should('not.contain', 'John Doe');
    });
  });

  // === Progressive complexity (add filters step by step) ===

  Scenario('SC-EDIT-4: Add swimlane filter to existing simple limit', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [], []);
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

    Step('And I see "5" in limit count input', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '5');
    });

    Step('And I see checkbox "all swimlanes" is checked', () => {
      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
    });

    Step('And I see checkbox "all columns" is checked', () => {
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
    });

    Step('When I click checkbox "all swimlanes"', () => {
      cy.contains('label', 'All swimlanes').click();
    });

    Step('Then I see checkbox "all columns" is checked', () => {
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
    });

    Step('And I see list of checkboxes in swimlanes with checked Frontend, Backend', () => {
      cy.contains('label', 'Frontend').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'Backend').find('input[type="checkbox"]').should('be.checked');
    });

    Step('When I click checkbox Backend', () => {
      cy.contains('label', 'Backend').click();
    });

    Step('Then I see checkbox Frontend is checked', () => {
      cy.contains('label', 'Frontend').find('input[type="checkbox"]').should('be.checked');
    });

    Step('And I see checkbox Backend is unchecked', () => {
      cy.contains('label', 'Backend').find('input[type="checkbox"]').should('not.be.checked');
    });

    Step('When I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step(
      'Then the limit for "John Doe" should apply only to swimlane "Frontend", all columns and limit value is 5',
      () => {
        cy.contains('tr', 'John Doe').within(() => {
          cy.contains('5').should('be.visible');
          cy.contains('Frontend').should('be.visible');
          cy.contains('All').should('be.visible');
        });
        cy.then(() => {
          const { limits } = useSettingsUIStore.getState().data;
          const limit = limits.find(l => l.person.name === 'john.doe');
          expect(limit?.swimlanes).to.have.length(1);
          expect(limit?.swimlanes[0].name).to.equal('Frontend');
          expect(limit?.columns).to.have.length(0);
          expect(limit?.limit).to.equal(5);
        });
      }
    );
  });

  Scenario('SC-EDIT-5: Add column filter to limit with swimlane', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for swimlane "Frontend" only', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [], [{ id: 'swim1', name: 'Frontend' }]);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I select only columns "To Do, In Progress"', () => {
      cy.contains('label', 'All columns').click();
      cy.contains('label', 'Done').click();
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step(
      'Then the limit for "John Doe" should apply to columns "To Do, In Progress" and swimlane "Frontend" and limit value is 5',
      () => {
        cy.contains('tr', 'John Doe').within(() => {
          cy.contains('5').should('be.visible');
          cy.contains('To Do, In Progress').should('be.visible');
          cy.contains('Frontend').should('be.visible');
        });
      }
    );
  });

  Scenario('SC-EDIT-5a: Changing swimlane filter does not affect column filter', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for all columns and all swimlanes', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [], []);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I uncheck "All swimlanes"', () => {
      cy.contains('label', 'All swimlanes').click();
    });

    Step('Then "All columns" should still be checked', () => {
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
    });

    Step('And the columns selection should not change', () => {
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
    });
  });

  Scenario('SC-EDIT-6: Add issue type filter to limit with columns and swimlane', () => {
    Step(
      'Given there is a limit for "john.doe" (John Doe) with value 5 for columns "To Do, In Progress" and swimlane "Frontend"',
      () => {
        const existingLimit = createLimit(
          1,
          'john.doe',
          'John Doe',
          5,
          [
            { id: 'col1', name: 'To Do' },
            { id: 'col2', name: 'In Progress' },
          ],
          [{ id: 'swim1', name: 'Frontend' }]
        );
        useSettingsUIStore.getState().actions.setData([existingLimit]);
      }
    );

    setupIssueTypesMock();
    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I uncheck "Count all issue types"', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').uncheck();
    });

    Step('And I select issue types "Task, Bug"', () => {
      selectIssueTypes('Task', 'Bug');
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step(
      'Then the limit for "John Doe" should apply to columns "To Do, In Progress", swimlane "Frontend" and issue types "Task, Bug" and limit value is 5',
      () => {
        cy.contains('tr', 'John Doe').within(() => {
          cy.contains('5').should('be.visible');
          cy.contains('To Do, In Progress').should('be.visible');
          cy.contains('Frontend').should('be.visible');
          cy.contains('Task, Bug').should('be.visible');
        });
      }
    );
  });

  // === Remove filters (expand to all) ===

  Scenario('SC-EDIT-7: Expand columns filter to all columns', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for columns "To Do, In Progress" only', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [
        { id: 'col1', name: 'To Do' },
        { id: 'col2', name: 'In Progress' },
      ]);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I check "All columns"', () => {
      cy.contains('label', 'All columns').find('input[type="checkbox"]').check();
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step('Then the limit for "John Doe" should apply to all columns', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.get('td').eq(2).should('contain.text', 'All');
      });
    });
  });

  Scenario('SC-EDIT-8: Expand swimlanes filter to all swimlanes', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for swimlane "Frontend" only', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5, [], [{ id: 'swim1', name: 'Frontend' }]);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I check "All swimlanes"', () => {
      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').check();
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step('Then the limit for "John Doe" should apply to all swimlanes', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.get('td').eq(3).should('contain.text', 'All');
      });
    });
  });

  Scenario('SC-EDIT-9: Expand issue types filter to all issue types', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5 for issue types "Task, Bug" only', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 'John Doe', 5),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I check "Count all issue types"', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').check();
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step('Then the limit for "John Doe" should count all issue types', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.get('td').eq(4).should('contain.text', 'All');
      });
    });
  });

  // === Preserve filters ===

  Scenario('SC-EDIT-10: Edit limit preserves issue type filter', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with issue types "Task, Bug"', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 'John Doe', 5),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('Then issue types "Task, Bug" should be selected', () => {
      cy.contains('Selected issue types:').should('be.visible');
      cy.contains('Task').should('be.visible');
      cy.contains('Bug').should('be.visible');
    });

    Step('And "Count all issue types" should be unchecked', () => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');
    });
  });

  // === Cancel ===

  Scenario('SC-EDIT-11: Cancel editing returns to add mode', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I change the limit to 10', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('10');
    });

    Step('And I select only swimlane "Frontend"', () => {
      cy.contains('label', 'All swimlanes').click();
      cy.contains('label', 'Backend').click();
    });

    Step('And I select only columns "To Do, In Progress"', () => {
      cy.contains('label', 'All columns').click();
      cy.contains('label', 'Done').click();
    });

    Step('And I click cancel editing', () => {
      cy.contains('button', 'Cancel').click();
    });

    Step('Then the button should show "Add limit"', () => {
      cy.contains('button', 'Add limit').should('be.visible');
    });

    Step('And the limit for "John Doe" should still show value 5', () => {
      cy.contains('tr', 'John Doe').within(() => {
        cy.contains('5').should('be.visible');
      });
    });
  });

  // === Validation ===

  Scenario('SC-EDIT-12: Zero value is auto-corrected to minimum in edit mode', () => {
    Step('Given there is a limit for "john.doe" (John Doe) with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "John Doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I set the limit to 0', () => {
      cy.get('#edit-person-wip-limit-person-limit').type('{selectall}0').blur();
    });

    Step('Then the limit field should show value 1', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '1');
    });
  });
});
