/// <reference types="cypress" />
/**
 * Cypress Component Tests: Validation
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground, mountComponent } from './helpers';
import featureText from './validation.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => {
    setupBackground();
    mountComponent();
  });
});
