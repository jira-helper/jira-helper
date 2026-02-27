/// <reference types="cypress" />

Cypress.Commands.add('drag', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).first().trigger('dragstart', { dataTransfer: new DataTransfer() });
  cy.get(targetSelector).first().trigger('dragover');
  cy.get(targetSelector).first().trigger('drop');
  cy.get(sourceSelector).first().trigger('dragend');
});

/**
 * Select a value in antd Select component.
 * @param selector - Select element selector (e.g., '#mySelect')
 * @param optionLabel - Label text of the option to select (e.g., 'Frontend')
 */
Cypress.Commands.add('selectAntdOption', (selector: string, optionLabel: string) => {
  // Click on the Select container - find the parent ant-select element
  cy.get(selector).closest('.ant-select').click();
  // Wait for dropdown to appear
  cy.get('.ant-select-dropdown', { timeout: 5000 }).should('be.visible');
  // Find option by label text and click
  cy.get('.ant-select-dropdown').contains(optionLabel).click();
});
