/// <reference types="cypress" />
import { defineFeature } from '../../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './gantt-chart-display.feature?raw';
import './steps/common.steps';
import './steps/interactions.steps';
import './steps/settings.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background, AfterScenario }) => {
  Background(() => setupBackground());
  AfterScenario(() => {
    cy.clock().invoke('restore');
  });
});
