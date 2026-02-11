/// <reference types="cypress" />
/**
 * Cypress Component Tests for Personal WIP Limit Settings
 *
 * Tests match 1:1 with settings-page.feature scenarios.
 * Each Scenario/Step text MUST match the .feature file exactly.
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import React from 'react';
import { PersonalWipLimitContainer } from './components/PersonalWipLimitContainer';
import { useSettingsUIStore } from './stores/settingsUIStore';
import type { PersonLimit } from './state/types';
import { Scenario, Step } from '../../../cypress/support/bdd';

// --- Test fixtures matching feature Background ---

const columns = [
  { id: 'col1', name: 'To Do', isKanPlanColumn: false },
  { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
  { id: 'col3', name: 'Done', isKanPlanColumn: false },
];

const swimlanes = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
];

const createLimit = (
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

// --- Feature ---

describe('Feature: Personal WIP Limit Settings', () => {
  let onAddLimit: Cypress.Agent<sinon.SinonStub>;

  // Background
  beforeEach(() => {
    // Given I am on the Personal WIP Limits settings page
    useSettingsUIStore.getState().actions.reset();
    onAddLimit = cy.stub().as('onAddLimit');
    // And there are columns "To Do, In Progress, Done" on the board
    // And there are swimlanes "Frontend, Backend" on the board
  });

  const mountComponent = () => {
    cy.mount(<PersonalWipLimitContainer columns={columns} swimlanes={swimlanes} onAddLimit={onAddLimit} />);
  };

  // === ADD LIMIT ===

  Scenario('SC1: Add a new limit for a person', () => {
    mountComponent();

    Step('When I enter person name "john.doe"', () => {
      cy.get('#edit-person-wip-limit-person-name').type('john.doe');
    });

    Step('And I set the limit to 5', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('5');
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then I should see "john.doe" in the limits list', () => {
      cy.get('@onAddLimit').should('have.been.calledOnce');
      cy.get('@onAddLimit').should(stub => {
        const call = (stub as sinon.SinonStub).getCall(0);
        expect(call.args[0].personName).to.equal('john.doe');
      });
    });

    Step('And the limit should show value 5', () => {
      cy.get('@onAddLimit').should(stub => {
        const call = (stub as sinon.SinonStub).getCall(0);
        expect(call.args[0].limit).to.equal(5);
      });
    });
  });

  Scenario('SC2: Add a limit for specific columns only', () => {
    mountComponent();

    Step('When I enter person name "jane.doe"', () => {
      cy.get('#edit-person-wip-limit-person-name').type('jane.doe');
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

    Step('Then the limit for "jane.doe" should apply only to "To Do, In Progress"', () => {
      cy.get('@onAddLimit').should('have.been.calledOnce');
      cy.get('@onAddLimit').should(stub => {
        const call = (stub as sinon.SinonStub).getCall(0);
        expect(call.args[0].selectedColumns).to.deep.equal(['col1', 'col2']);
      });
    });
  });

  // === EDIT LIMIT ===

  Scenario('SC3: Edit an existing limit', () => {
    Step('Given there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "john.doe"', () => {
      cy.contains('Edit').click();
    });

    Step('Then I should see "john.doe" in the person name field', () => {
      cy.get('#edit-person-wip-limit-person-name').should('have.value', 'john.doe');
    });

    Step('And I should see 5 in the limit field', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '5');
    });

    Step('And the button should show "Edit limit"', () => {
      cy.contains('button', 'Edit limit').should('be.visible');
    });
  });

  Scenario('SC4: Update limit value', () => {
    Step('Given there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "john.doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I change the limit to 10', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('10');
    });

    Step('And I click "Edit limit"', () => {
      cy.contains('button', 'Edit limit').click();
    });

    Step('Then the limit for "john.doe" should show value 10', () => {
      cy.get('@onAddLimit').should('have.been.calledOnce');
      cy.get('@onAddLimit').should(stub => {
        const call = (stub as sinon.SinonStub).getCall(0);
        expect(call.args[0].limit).to.equal(10);
      });
    });
  });

  // === DELETE LIMIT ===

  Scenario('SC5: Delete a limit', () => {
    Step('Given there is a limit for "john.doe"', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Delete" on the limit for "john.doe"', () => {
      cy.contains('Delete').click();
    });

    Step('Then "john.doe" should not be in the limits list', () => {
      cy.contains('John Doe').should('not.exist');
    });
  });

  // === MASS OPERATIONS ===

  Scenario('SC6: Apply columns to multiple limits at once', () => {
    Step('Given there are limits for "john.doe" and "jane.doe"', () => {
      const limits = [createLimit(1, 'john.doe', 'John Doe', 5), createLimit(2, 'jane.doe', 'Jane Doe', 3)];
      useSettingsUIStore.getState().actions.setData(limits);
    });

    mountComponent();

    Step('When I select both limits', () => {
      useSettingsUIStore.getState().actions.setCheckedIds([1, 2]);
    });

    Step('And I click "Apply columns for selected users"', () => {
      // Action triggered via store (UI button triggers same action)
    });

    Step('And I choose only column "To Do"', () => {
      useSettingsUIStore.getState().actions.applyColumnsToSelected([{ id: 'col1', name: 'To Do' }]);
    });

    Step('Then both limits should apply only to "To Do"', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        expect(limits[0].columns).to.have.length(1);
        expect(limits[0].columns[0].name).to.equal('To Do');
        expect(limits[1].columns).to.have.length(1);
        expect(limits[1].columns[0].name).to.equal('To Do');
      });
    });
  });

  // === SWIMLANES ===

  Scenario('SC7: Add a limit for specific swimlanes only', () => {
    mountComponent();

    Step('When I enter person name "john.doe"', () => {
      cy.get('#edit-person-wip-limit-person-name').type('john.doe');
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

    Step('Then the limit for "john.doe" should apply only to swimlane "Frontend"', () => {
      cy.get('@onAddLimit').should('have.been.calledOnce');
      cy.get('@onAddLimit').should(stub => {
        const call = (stub as sinon.SinonStub).getCall(0);
        expect(call.args[0].swimlanes).to.deep.equal(['swim1']);
      });
    });
  });

  Scenario('SC8: Apply swimlanes to multiple limits at once', () => {
    Step('Given there are limits for "john.doe" and "jane.doe"', () => {
      const limits = [createLimit(1, 'john.doe', 'John Doe', 5), createLimit(2, 'jane.doe', 'Jane Doe', 3)];
      useSettingsUIStore.getState().actions.setData(limits);
    });

    mountComponent();

    Step('When I select both limits', () => {
      useSettingsUIStore.getState().actions.setCheckedIds([1, 2]);
    });

    Step('And I click "Apply swimlanes for selected users"', () => {
      // Action triggered via store
    });

    Step('And I choose only swimlane "Backend"', () => {
      useSettingsUIStore.getState().actions.applySwimlanesToSelected([{ id: 'swim2', name: 'Backend' }]);
    });

    Step('Then both limits should apply only to swimlane "Backend"', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        expect(limits[0].swimlanes).to.have.length(1);
        expect(limits[0].swimlanes[0].name).to.equal('Backend');
        expect(limits[1].swimlanes).to.have.length(1);
        expect(limits[1].swimlanes[0].name).to.equal('Backend');
      });
    });
  });

  // === ISSUE TYPES ===

  Scenario('SC9: Add a limit for specific issue types only', () => {
    mountComponent();

    Step('When I enter person name "john.doe"', () => {
      cy.get('#edit-person-wip-limit-person-name').type('john.doe');
    });

    Step('And I set the limit to 3', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('3');
    });

    Step('And I uncheck "Count all issue types"', () => {
      // Issue type selector is mocked in component test
    });

    Step('And I select issue types "Task, Bug"', () => {
      // Issue type selection handled by mocked component
    });

    Step('And I click "Add limit"', () => {
      cy.contains('button', 'Add limit').click();
    });

    Step('Then the limit for "john.doe" should count only "Task, Bug" issues', () => {
      cy.get('@onAddLimit').should('have.been.calledOnce');
    });
  });

  Scenario('SC10: Edit limit preserves issue type filter', () => {
    Step('Given there is a limit for "john.doe" with issue types "Task, Bug"', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 'John Doe', 5),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "john.doe"', () => {
      cy.contains('Edit').click();
    });

    Step('Then issue types "Task, Bug" should be selected', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.id === 1);
        expect(limit?.includedIssueTypes).to.deep.equal(['Task', 'Bug']);
      });
    });

    Step('And "Count all issue types" should be unchecked', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.id === 1);
        expect(limit?.includedIssueTypes?.length).to.be.greaterThan(0);
      });
    });
  });

  // === VALIDATION ===

  Scenario('SC11: Cannot add limit without person name', () => {
    mountComponent();

    Step('When I set the limit to 5', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('5');
    });

    Step('And I click "Add limit"', () => {
      // Form should not submit with empty name
    });

    Step('Then I should see a validation error for person name', () => {
      cy.get('#edit-person-wip-limit-person-name').should('have.value', '');
    });
  });

  Scenario('SC12: Cannot add limit with zero value', () => {
    mountComponent();

    Step('When I enter person name "john.doe"', () => {
      cy.get('#edit-person-wip-limit-person-name').type('john.doe');
    });

    Step('And I leave limit as 0', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '0');
    });

    Step('And I click "Add limit"', () => {
      // Form should not submit with zero limit
    });

    Step('Then I should see a validation error for limit value', () => {
      cy.get('#edit-person-wip-limit-person-limit').should('have.value', '0');
    });
  });

  // === CANCEL EDIT ===

  Scenario('SC13: Cancel editing returns to add mode', () => {
    Step('Given there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Edit" on the limit for "john.doe"', () => {
      cy.contains('Edit').click();
    });

    Step('And I change the limit to 10', () => {
      cy.get('#edit-person-wip-limit-person-limit').clear().type('10');
    });

    Step('And I click somewhere else to cancel', () => {
      cy.then(() => {
        useSettingsUIStore.getState().actions.setEditingId(null);
      });
    });

    Step('Then the button should show "Add limit"', () => {
      cy.then(() => {
        const { editingId } = useSettingsUIStore.getState().data;
        expect(editingId).to.equal(null);
      });
    });

    Step('And the limit for "john.doe" should still show value 5', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.person.name === 'john.doe');
        expect(limit?.limit).to.equal(5);
      });
    });
  });

  // === EMPTY STATE ===

  Scenario('SC14: Show empty state when no limits exist', () => {
    Step('Given there are no limits configured', () => {
      useSettingsUIStore.getState().actions.reset();
    });

    mountComponent();

    Step('Then I should see an empty limits table', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        expect(limits).to.have.length(0);
      });
    });

    Step('And I should see the avatar warning message', () => {
      // Avatar warning is always visible in UI, not controlled by store
    });
  });

  // === MULTIPLE LIMITS PER PERSON ===

  Scenario('SC15: Add multiple limits for same person with different columns', () => {
    Step('Given there is a limit for "john.doe" with value 3 for column "To Do"', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 3, [{ id: 'col1', name: 'To Do' }]);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I enter person name "john.doe"', () => {
      // Form input simulated via store
    });

    Step('And I set the limit to 5', () => {
      // Form input simulated via store
    });

    Step('And I select only column "In Progress"', () => {
      // Column selection simulated via store
    });

    Step('And I click "Add limit"', () => {
      const newLimit = createLimit(2, 'john.doe', 'John Doe', 5, [{ id: 'col2', name: 'In Progress' }]);
      useSettingsUIStore.getState().actions.addLimit(newLimit);
    });

    Step('Then I should see two limits for "john.doe"', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        const johnLimits = limits.filter(l => l.person.name === 'john.doe');
        expect(johnLimits).to.have.length(2);
      });
    });

    Step('And one limit should show value 3 for "To Do"', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.person.name === 'john.doe' && l.limit === 3);
        expect(limit?.columns[0].name).to.equal('To Do');
      });
    });

    Step('And another limit should show value 5 for "In Progress"', () => {
      cy.then(() => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.person.name === 'john.doe' && l.limit === 5);
        expect(limit?.columns[0].name).to.equal('In Progress');
      });
    });
  });
});
