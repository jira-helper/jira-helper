/// <reference types="cypress" />
import { defineFeature } from '../../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './gantt-chart-interactions.feature?raw';
import './steps/common.steps';
import './steps/interactions.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background, AfterScenario }) => {
  Background(() => setupBackground());
  AfterScenario(() => {
    cy.clock().invoke('restore');
  });
});
