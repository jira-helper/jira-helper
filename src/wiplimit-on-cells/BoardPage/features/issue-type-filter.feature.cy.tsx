/// <reference types="cypress" />
/**
 * Cypress Component Tests: Issue Type Filter
 */
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground, cleanupBoard } from './helpers';
import { setBoardContext } from './steps/common.steps';
import featureText from './issue-type-filter.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background, AfterScenario }) => {
  let boardContext: ReturnType<typeof setupBackground>;

  Background(() => {
    boardContext = setupBackground();
    setBoardContext(boardContext);
  });

  AfterScenario(() => {
    cleanupBoard(boardContext.container);
  });
});
