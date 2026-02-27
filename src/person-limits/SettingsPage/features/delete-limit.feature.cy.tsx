/// <reference types="cypress" />
/**
 * Cypress Component Tests: Delete Limit
 * Scenarios: SC-DELETE-1
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import { useSettingsUIStore } from '../stores/settingsUIStore';
import { Scenario, Step } from '../../../../cypress/support/bdd';
import { createLimit, setupBackground, mountComponent } from './helpers';

describe('Feature: Personal WIP Limit Settings — Delete Limit', () => {
  beforeEach(() => {
    setupBackground();
  });

  Scenario('SC-DELETE-1: Delete a limit', () => {
    Step('Given there is a limit for "john.doe" (John Doe)', () => {
      const existingLimit = createLimit(1, 'john.doe', 'John Doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    mountComponent();

    Step('When I click "Delete" on the limit for "John Doe"', () => {
      cy.contains('Delete').click();
    });

    Step('Then "John Doe" should not be in the limits list', () => {
      cy.contains('John Doe').should('not.exist');
    });
  });
});
