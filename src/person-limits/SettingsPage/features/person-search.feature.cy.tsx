/// <reference types="cypress" />
/**
 * Cypress Component Tests: Person Search
 *
 * All scenarios from the .feature file run automatically.
 * Step definitions are imported from steps/common.steps.ts
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './person-search.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
