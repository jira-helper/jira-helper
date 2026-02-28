/**
 * Common step definitions for Column Limits SettingsPage tests.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import { useColumnLimitsPropertyStore } from '../../../property/store';
import { WITHOUT_GROUP_ID } from '../../../types';
import { columns, createButtonStubs, mountButton } from '../helpers';

// Re-export for convenience
export { Given, When, Then };
export type { DataTableRows };

// --- Background steps ---

Given('I am on the Column WIP Limits settings page', () => {
  // Background setup is handled in setupBackground()
});

Given(/^there are columns "([^"]*)" on the board$/, () => {
  // Columns are already set in fixtures
});

// --- Given steps ---

Given('no column groups are configured', () => {
  useColumnLimitsPropertyStore.getState().actions.reset();
  useColumnLimitsSettingsUIStore.getState().actions.reset();
});

Given('there are configured column groups:', (table: DataTableRows) => {
  const groups: Record<string, { columns: string[]; max: number }> = {};

  table.forEach(row => {
    const columnNames = row.columns.split(',').map(s => s.trim());
    const columnIds = columnNames.map(name => {
      const col = columns.find(c => c.name === name);
      return col?.id || name;
    });
    groups[row.name] = {
      columns: columnIds,
      max: parseInt(row.limit, 10),
    };
  });

  useColumnLimitsPropertyStore.getState().actions.setData(groups);
});

// --- When steps ---

When('I open the settings modal', () => {
  const buttonStubs = createButtonStubs();
  mountButton(buttonStubs);
  cy.contains('Group limits').click();
  cy.get('[role="dialog"]').should('exist');
});

When('I click {string}', (buttonText: string) => {
  cy.contains('button', buttonText).click();
});

When(/^I drag "([^"]*)" column to create a new group$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.drag(`[data-column-id="${col.id}"]`, '#jh-column-dropzone');
});

When(/^I set limit to (\d+)$/, (limitValue: string) => {
  cy.get('.group-limits-input-jh').first().click().type(`{selectall}${limitValue}`);
  cy.get('body').click();
  cy.wait(100);
});

// --- Then steps ---

Then('I should see the modal', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Limits for groups').should('be.visible');
});

Then('the modal should be closed', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

Then(/^the "Without Group" section should contain all columns$/, () => {
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`)
    .first()
    .within(() => {
      columns.forEach(col => {
        cy.contains(col.name).should('exist');
      });
    });
});

Then(/^the "Without Group" section should contain "([^"]*)" and "([^"]*)"$/, (col1: string, col2: string) => {
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`)
    .first()
    .within(() => {
      cy.contains(col1).should('exist');
      cy.contains(col2).should('exist');
    });
});

Then(/^the "Without Group" section should be empty$/, () => {
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`)
    .first()
    .within(() => {
      cy.get('[data-column-id]').should('have.length', 0);
    });
});

Then('there should be no configured groups', () => {
  cy.get('.group-limits-input-jh').should('have.length', 0);
});

Then(
  /^I should see group "([^"]*)" with columns "([^"]*)" and limit (\d+)$/,
  (_groupName: string, columnNames: string, limit: string) => {
    const names = columnNames.split(',').map(s => s.trim());

    cy.get('.group-limits-input-jh')
      .first()
      .closest('.ant-card')
      .within(() => {
        names.forEach(name => {
          cy.contains(name).should('exist');
        });
        cy.get('input').should('have.value', limit);
      });
  }
);

Then('no changes should be saved', () => {
  cy.get('@updateBoardProperty').should('not.have.been.called');
});

Then('changes should be saved', () => {
  cy.get('@updateBoardProperty').should('have.been.called');
});
