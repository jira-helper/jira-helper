/// <reference types="cypress" />
/**
 * Cypress Component Tests: Show Badge and Empty State
 */
import { defineFeature } from 'cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './show-badge.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => {
    setupBackground();
  });
});
