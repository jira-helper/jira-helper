/**
 * Common step definitions for WIP Limit on Cells SettingsPage tests.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { setupBackground, mountComponent, createRange, columns, swimlanes } from '../helpers';
import { normalizeRange } from 'src/wiplimit-on-cells/property/actions/loadProperty';

// Re-export for convenience
export { Given, When, Then };
export type { DataTableRows };

// --- State for building ranges across Given steps ---

const pendingRanges: Map<
  string,
  { wipLimit: number; disable: boolean; cells: Array<{ swimlane: string; column: string; showBadge: boolean }> }
> = new Map();

let componentMounted = false;

// --- Background steps ---

Given('I am on the WIP Limit on Cells settings page', () => {
  setupBackground();
  pendingRanges.clear();
  componentMounted = false;
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
  // DataTable format: | wipLimit | disable | -> | 5 | false |
  if (dataTable.length > 0) {
    const row = dataTable[0];
    if (row.wipLimit !== undefined) config.wipLimit = parseInt(row.wipLimit, 10);
    if (row.disable !== undefined) config.disable = row.disable === 'true';
  }
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
  // Build and mount pending ranges (skip if already mounted by a special Given step)
  if (!componentMounted) {
    const ranges = Array.from(pendingRanges.entries()).map(([name, config]) =>
      createRange(name, config.wipLimit, config.cells, config.disable)
    );
    pendingRanges.clear();
    mountComponent(ranges);
  }
  componentMounted = false;

  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains('Edit WipLimit on cells').should('exist');
});

Given(/^I have opened the "([^"]*)" popup$/, (popupTitle: string) => {
  mountComponent([]);
  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains(popupTitle).should('exist');
});

When('I click the close button (X)', () => {
  cy.get('.ant-modal-close').click();
});

When('I reopen the modal', () => {
  // Modal is closed after Save - click the settings button again to reopen
  cy.contains('button', 'Edit Wip limits by cells').click();
  cy.contains('Edit WipLimit on cells').should('exist');
});

When(/^I add a range "([^"]*)"$/, (rangeName: string) => {
  // Type range name in Add range input
  cy.get('#WIP_inputRange').clear().type(rangeName);
  // Select swimlane (required for Add range) - click the Select container, not the hidden input
  cy.contains('label', 'Swimlane').closest('.ant-form-item').find('.ant-select').click();
  cy.get('.ant-select-dropdown:visible').contains('Frontend').click();
  // Select column (required for Add range)
  cy.contains('label', 'Column').closest('.ant-form-item').find('.ant-select').click();
  cy.get('.ant-select-dropdown:visible').contains('To Do').click();
  // Click Add range button
  cy.contains('button', 'Add range').click();
});

Then(/^I should see range "([^"]*)" in the table$/, (rangeName: string) => {
  cy.get(`input[aria-label*="${rangeName}"]`, { timeout: 5000 }).should('exist');
});

// --- Range table ---

Then('I should see the ranges table', () => {
  cy.get('#WipLimitCells_table').should('exist');
});

Then(/^I should see "([^"]*)" in the ranges table$/, (rangeName: string) => {
  cy.get(`input[aria-label*="${rangeName}"]`, { timeout: 5000 }).should('exist');
});

Then(/^the range "([^"]*)" should have WIP limit (\d+)$/, (rangeName: string, limit: string) => {
  cy.get(`input[aria-label*="WIP limit for ${rangeName}"]`, { timeout: 5000 }).should('have.value', String(limit));
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

// --- Edit Range ---

When(/^I change the name of range "([^"]*)" to "([^"]*)"$/, (oldName: string, newName: string) => {
  cy.get(`input[aria-label*="Range name for ${oldName}"]`).clear().type(newName);
});

When(/^I change the WIP limit of range "([^"]*)" to "([^"]*)"$/, (rangeName: string, newLimit: string) => {
  cy.get(`input[aria-label*="WIP limit for ${rangeName}"]`).clear().type(newLimit);
});

When('I click away to confirm', () => {
  cy.get('body').click(0, 0);
  cy.wait(100);
});

When(/^I check "Disable" for range "([^"]*)"$/, (rangeName: string) => {
  cy.get(`input[aria-label*="Disable range ${rangeName}"]`).check();
});

Then(/^I see "Disable" checked for range "([^"]*)"$/, (rangeName: string) => {
  cy.get(`input[aria-label*="Disable range ${rangeName}"]`).should('be.checked');
});

When(/^I click the edit icon for range "([^"]*)"$/, (rangeName: string) => {
  cy.get(`[aria-label*="Select range ${rangeName}"]`).click();
});

Then(/^I see input "([^"]*)" in ranges table$/, (value: string) => {
  cy.get(`input[aria-label*="${value}"]`).should('exist');
});

Then(/^I do not see input "([^"]*)" in ranges table$/, (value: string) => {
  cy.get(`input[aria-label*="${value}"]`).should('not.exist');
});

// --- Save/Cancel ---

Then('the changes should be saved to Jira board property', () => {
  cy.get('@onSaveToProperty').should('have.been.called');
});

Then('the changes should not be saved', () => {
  cy.get('@onSaveToProperty').should('not.have.been.called');
});

// --- Show Badge ---

Then(/^the cell "([^"]*)" should show the badge icon$/, (cellName: string) => {
  cy.get('#WipLimitCells_table').contains(cellName).closest('.ant-tag').find('.anticon-info-circle').should('exist');
});

Then(/^the cell "([^"]*)" should not show the badge icon$/, (cellName: string) => {
  cy.get('#WipLimitCells_table').contains(cellName).should('exist');
  cy.get('#WipLimitCells_table')
    .contains(cellName)
    .closest('.ant-tag')
    .find('.anticon-info-circle')
    .should('not.exist');
});

Then('I see the ranges table with headers', () => {
  cy.get('#WipLimitCells_table').should('exist');
  cy.get('#WipLimitCells_table thead').should('exist');
  cy.get('#WipLimitCells_table thead').contains('Range name').should('exist');
  cy.get('#WipLimitCells_table thead').contains('WIP limit').should('exist');
  cy.get('#WipLimitCells_table thead').contains('Disable').should('exist');
  cy.get('#WipLimitCells_table thead').contains('Cells (swimlane/column)').should('exist');
});

// --- Legacy compatibility ---

Given(/^there are legacy settings with swimline "([^"]*)" cell "([^"]*)"$/, (rangeName: string, cellName: string) => {
  // Parse cell name "Frontend / In Progress" to get swimlane and column
  const [swName, colName] = cellName.split(' / ');
  const sw = swimlanes.find(s => s.name === swName);
  const col = columns.find(c => c.name === colName);
  if (!sw || !col) throw new Error(`Invalid cell "${cellName}"`);

  // Create legacy range with "swimline" instead of "swimlane"
  const legacyRange = {
    name: rangeName,
    wipLimit: 5,
    cells: [{ swimline: sw.id, column: col.id, showBadge: false }],
  };

  // Normalize and mount - normalizeRange converts swimline to swimlane
  const normalizedRange = normalizeRange(legacyRange);
  pendingRanges.clear();
  mountComponent([normalizedRange]);
  componentMounted = true;
});
