/// <reference types="cypress" />
/**
 * Cypress Component Tests: Modal Lifecycle
 *
 * All scenarios from the .feature file run automatically.
 * Step definitions are imported from steps/common.steps.ts
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './modal-lifecycle.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
