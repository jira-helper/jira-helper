/// <reference types="cypress" />
import { defineFeature } from '../../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './gantt-chart-quick-filters.feature?raw';
import './steps/common.steps';
import './steps/quickFilters.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background, BeforeScenario, AfterScenario }) => {
  Background(() => setupBackground());
  BeforeScenario(() => {
    cy.window().then(win => {
      cy.spy(win.console, 'error').as('bddConsoleError');
    });
  });
  AfterScenario(() => {
    cy.clock().invoke('restore');
  });
});
