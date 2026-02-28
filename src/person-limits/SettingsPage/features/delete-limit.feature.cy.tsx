/// <reference types="cypress" />
/**
 * Cypress Component Tests: Delete Limit (v2 - using BDD runner with parsed feature)
 *
 * All scenarios from the .feature file run automatically.
 * Step definitions are imported from steps/common.steps.ts
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './delete-limit.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
