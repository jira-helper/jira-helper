/// <reference types="cypress" />
/**
 * Cypress Component Tests: Edit Range
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './edit-range.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => {
    setupBackground();
  });
});
