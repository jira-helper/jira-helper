/**
 * Common step definitions for WIP Limit on Cells SettingsPage tests.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { setupBackground, mountComponent, createRange, columns, swimlanes } from '../helpers';

// Re-export for convenience
export { Given, When, Then };
export type { DataTableRows };

// --- State for building ranges across Given steps ---

const pendingRanges: Map<
  string,
  { wipLimit: number; disable: boolean; cells: Array<{ swimlane: string; column: string; showBadge: boolean }> }
> = new Map();

// --- Background steps ---

Given('I am on the WIP Limit on Cells settings page', () => {
  setupBackground();
  pendingRanges.clear();
});

Given(/^there are columns "([^"]*)" on the board$/, () => {
  // Columns are pre-configured in helpers
});

Given(/^there are swimlanes "([^"]*)" on the board$/, () => {
  // Swimlanes are pre-configured in helpers
});

// --- Pre-configured ranges (Given steps with DataTable) ---

Given(/^there is a range "([^"]*)" with:$/, (rangeName: string, dataTable: DataTableRows) => {
  const config: { wipLimit: number; disable: boolean } = { wipLimit: 0, disable: false };
  dataTable.forEach(row => {
    if (row.wipLimit !== undefined) config.wipLimit = parseInt(row.wipLimit, 10);
    if (row.disable !== undefined) config.disable = row.disable === 'true';
  });
  pendingRanges.set(rangeName, { ...config, cells: [] });
});

Given(/^the range "([^"]*)" has cells:$/, (rangeName: string, dataTable: DataTableRows) => {
  const pending = pendingRanges.get(rangeName);
  if (!pending)
    throw new Error(`Range "${rangeName}" not defined. Use 'Given there is a range "${rangeName}" with:' first.`);

  const cells = dataTable.map(row => {
    const sw = swimlanes.find(s => s.name === row.swimlane);
    const col = columns.find(c => c.name === row.column);
    if (!sw || !col) throw new Error(`Invalid swimlane "${row.swimlane}" or column "${row.column}"`);
    return {
      swimlane: sw.id,
      column: col.id,
      showBadge: row.showBadge === 'true',
    };
  });
  pending.cells = cells;
  pendingRanges.set(rangeName, pending);
});

// --- Modal lifecycle ---

When('I open the settings popup', () => {
  // Build and mount pending ranges
  const ranges = Array.from(pendingRanges.entries()).map(([name, config]) =>
    createRange(name, config.wipLimit, config.cells, config.disable)
  );
  pendingRanges.clear();
  mountComponent(ranges);

  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains('Edit WipLimit on cells').should('exist');
});

When(/^I click "([^"]*)"$/, (buttonText: string) => {
  if (buttonText === 'Add range' || buttonText === 'Add cell') {
    cy.window().then(win => {
      if (!(win.alert as sinon.SinonStub)?.restore) {
        cy.stub(win, 'alert').as('alert');
      }
    });
    cy.get('#WIP_buttonRange').click();
  } else {
    cy.contains('button', buttonText).click();
  }
});

Then(/^I should see the "([^"]*)" popup$/, (title: string) => {
  cy.contains(title).should('exist');
});

Given(/^I have opened the "([^"]*)" popup$/, (popupTitle: string) => {
  mountComponent([]);
  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains(popupTitle).should('exist');
});

When('I click the close button (X)', () => {
  cy.get('.ant-modal-close').click();
});

// --- Form inputs ---

When(/^I check "([^"]*)"$/, (label: string) => {
  if (label === 'show indicator') {
    cy.get('#WIPLC_showBadge').check();
  } else {
    cy.contains('label', label).click();
  }
});

// --- Range table ---

Then('I should see the ranges table', () => {
  cy.get('#WipLimitCells_table').should('exist');
});

// === Modal Lifecycle Additional ===

Then(/^I should see the "([^"]*)" form$/, (formName: string) => {
  if (formName === 'Add range') {
    cy.get('#WIP_inputRange').should('exist');
  }
});

Then('I should see the swimlane dropdown', () => {
  cy.get('#WIPLC_swimlane').should('exist');
});

Then('I should see the column dropdown', () => {
  cy.get('#WIPLC_Column').should('exist');
});

Then(/^I should see the "([^"]*)" checkbox$/, (label: string) => {
  if (label === 'show indicator') {
    cy.get('#WIPLC_showBadge').should('exist');
  }
});

Then(/^I should see "([^"]*)" in the ranges table$/, (rangeName: string) => {
  cy.get(`input[aria-label*="${rangeName}"]`, { timeout: 5000 }).should('exist');
});

Then(/^the range "([^"]*)" should have WIP limit (\d+)$/, (rangeName: string, limit: string) => {
  cy.get(`input[aria-label*="WIP limit for ${rangeName}"]`).should('have.value', limit);
});

Then(/^the range "([^"]*)" should contain cell "([^"]*)"$/, (_rangeName: string, cellName: string) => {
  cy.get('#WipLimitCells_table').contains(cellName).should('exist');
});

Then(/^the cell "([^"]*)" should have the badge indicator icon$/, (cellName: string) => {
  cy.get('#WipLimitCells_table').contains(cellName).parent().find('.anticon-info-circle').should('exist');
});

Then('the ranges table should remain unchanged', () => {
  cy.get('#WipLimitCells_tbody').find('tr').should('have.length', 0);
});

Then('the ranges table should be empty', () => {
  cy.get('#WipLimitCells_tbody').find('tr').should('have.length', 0);
});

Then('the ranges table should still have only one range', () => {
  cy.get('#WipLimitCells_tbody').find('tr').should('have.length', 1);
});

Then(/^the range "([^"]*)" should contain cells:$/, (_rangeName: string, dataTable: DataTableRows) => {
  // Check exact number of cells
  cy.get('#WipLimitCells_table .ant-tag').should('have.length', dataTable.length);
  // Check each cell exists
  dataTable.forEach(row => {
    cy.get('#WipLimitCells_table').contains(`${row.swimlane} / ${row.column}`).should('exist');
  });
});

// --- Save/Cancel ---

Then('the changes should be saved to Jira board property', () => {
  cy.get('@onSaveToProperty').should('have.been.called');
});

Then('the changes should not be saved', () => {
  cy.get('@onSaveToProperty').should('not.have.been.called');
});
