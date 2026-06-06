/// <reference types="cypress" />
/**
 * Cypress Component Tests: Swimlane Strategy
 *
 * Verifies that the Personal WIP Limit settings modal hides the swimlane section
 * when the board's swimlaneStrategy is not "custom" (i.e. saved query swimlanes
 * are inert), and works end-to-end without the section.
 */
import { defineFeature } from 'cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './swimlane-strategy.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
