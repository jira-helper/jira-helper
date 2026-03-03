/**
 * Global Gherkin step definitions for BDD tests.
 *
 * Import in every .feature.cy.tsx file:
 *   import 'cypress/support/gherkin-steps/common';
 *
 * ESLint rule require-gherkin-steps-import enforces this.
 */
import { When, Then } from '../bdd-runner';

// === Text Visibility ===
Then('I see text {string}', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('I do not see text {string}', (text: string) => {
  cy.contains(text).should('not.exist');
});

// === Buttons ===
Then('I see {string} button', (text: string) => {
  cy.contains('button', text).should('be.visible');
});

Then('I do not see {string} button', (text: string) => {
  cy.contains('button', text).should('not.exist');
});

When('I click {string} button', (text: string) => {
  cy.contains('button', text).click();
});

When('I click {string}', (text: string) => {
  cy.contains(text).click();
});

// === Checkboxes ===
Then('I see checkbox {string} is checked', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').should('be.checked');
});

Then('I see checkbox {string} is unchecked', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').should('not.be.checked');
});

When('I check {string}', (label: string) => {
  // Use click instead of check for Ant Design Checkbox compatibility
  cy.contains('label', label).find('input[type="checkbox"]').should('not.be.checked');
  cy.contains('label', label).click();
});

When('I uncheck {string}', (label: string) => {
  // Use click instead of uncheck for Ant Design Checkbox compatibility
  cy.contains('label', label).find('input[type="checkbox"]').should('be.checked');
  cy.contains('label', label).click();
});

// === Modal ===
Then('I see the modal', () => {
  cy.get('[role="dialog"]').should('be.visible');
});

Then('I see the modal {string}', (title: string) => {
  cy.get('[role="dialog"]').should('be.visible').and('contain', title);
});

Then('I do not see the modal', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

Then('I do not see the modal {string}', (title: string) => {
  cy.contains('[role="dialog"]', title).should('not.exist');
});

// === Inputs ===
// Works with Ant Design Form.Item and standard HTML forms
// Uses 'for' attribute if available, otherwise closest('.ant-form-item')

const findInputByLabel = (label: string) => {
  return cy.contains('label', label).then($label => {
    const forAttr = $label.attr('for');
    if (forAttr) {
      return cy.get(`#${forAttr}`);
    }
    return cy.wrap($label).closest('.ant-form-item').find('input').first();
  });
};

Then('I see input {string} has value {string}', (label: string, value: string) => {
  findInputByLabel(label).should('have.value', value);
});

When('I type {string} into {string} input', (text: string, label: string) => {
  findInputByLabel(label).clear().type(text);
});

When('I clear {string} input', (label: string) => {
  findInputByLabel(label).clear();
});

// === Dropdowns/Select ===
// Works with Ant Design Select inside Form.Item

When('I select {string} from {string} dropdown', (optionText: string, label: string) => {
  cy.contains('label', label).then($label => {
    const forAttr = $label.attr('for');
    if (forAttr) {
      cy.selectAntdOption(`#${forAttr}`, optionText);
    } else {
      cy.wrap($label).closest('.ant-form-item').find('.ant-select').click();
      cy.get('.ant-select-dropdown:visible').contains(optionText).click();
    }
  });
});

Then('I see {string} selected in {string} dropdown', (optionText: string, label: string) => {
  cy.contains('label', label).then($label => {
    const forAttr = $label.attr('for');
    if (forAttr) {
      cy.get(`#${forAttr}`).closest('.ant-select').should('contain', optionText);
    } else {
      cy.wrap($label).closest('.ant-form-item').find('.ant-select').should('contain', optionText);
    }
  });
});

// === Elements by selector ===
Then('I see element {string}', (selector: string) => {
  cy.get(selector).should('be.visible');
});

Then('I do not see element {string}', (selector: string) => {
  cy.get(selector).should('not.exist');
});

// === Field validation ===
Then('I see {string} field has error', (label: string) => {
  cy.contains('label', label).closest('.ant-form-item').should('have.class', 'ant-form-item-has-error');
});

Then('I see {string} field has no error', (label: string) => {
  cy.contains('label', label).closest('.ant-form-item').should('not.have.class', 'ant-form-item-has-error');
});
