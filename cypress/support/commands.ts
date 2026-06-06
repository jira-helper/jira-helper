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
  cy.get(selector)
    .closest('.ant-select')
    .then($select => {
      if (!$select.hasClass('ant-select-open')) {
        cy.wrap($select).click();
      }
    });
  cy.get('.ant-select-dropdown', { timeout: 5000 })
    .not('.ant-select-dropdown-hidden')
    .should('be.visible')
    .contains(optionLabel)
    .click();
  cy.get(selector)
    .closest('.ant-select')
    .then($select => {
      if ($select.hasClass('ant-select-open')) {
        cy.get('body').click(0, 0, { force: true });
      }
    });
});
