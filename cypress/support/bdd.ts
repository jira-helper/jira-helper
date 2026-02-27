/**
 * BDD helpers for Cypress component tests.
 *
 * Maps Gherkin Scenario/Step to Cypress it/cy.log so that
 * .cy.tsx tests mirror .feature files 1:1.
 *
 * Usage:
 *   import { Scenario, Step } from '../../../cypress/support/bdd';
 *
 * Text of Scenario and Step MUST match .feature file exactly.
 * Validate with: node scripts/validate-feature-tests.mjs
 */

/**
 * Wraps a Gherkin Scenario as a Cypress `it` block.
 * @param name — exact Scenario title from .feature (without "Scenario: " prefix)
 */
export const Scenario = (name: string, fn: () => void) => it(`Scenario: ${name}`, fn);

/**
 * Logs a Gherkin step (Given/When/Then/And) in Cypress command log
 * and executes the step body.
 * @param name — exact step text from .feature (e.g. "When I click \"Save\"")
 */
export const Step = (name: string, fn: () => void) => {
  cy.log(`**${name}**`);
  fn();
};
