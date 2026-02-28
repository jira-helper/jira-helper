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
  cy.contains('label', label).find('input[type="checkbox"]').check({ force: true });
});

When('I uncheck {string}', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').uncheck({ force: true });
});

// === Modal ===
Then('I see the modal', () => {
  cy.get('[role="dialog"]').should('be.visible');
});

Then('I do not see the modal', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

// === Inputs ===
Then('I see input {string} has value {string}', (label: string, value: string) => {
  cy.contains('label', label).parent().find('input').should('have.value', value);
});

When('I type {string} into {string} input', (text: string, label: string) => {
  cy.contains('label', label).parent().find('input').clear().type(text);
});

When('I clear {string} input', (label: string) => {
  cy.contains('label', label).parent().find('input').clear();
});

// === Elements by selector ===
Then('I see element {string}', (selector: string) => {
  cy.get(selector).should('be.visible');
});

Then('I do not see element {string}', (selector: string) => {
  cy.get(selector).should('not.exist');
});
