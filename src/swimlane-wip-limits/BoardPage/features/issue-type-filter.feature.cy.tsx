/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground, cleanupBoard } from './helpers';
import { setBoardContext } from './steps/common.steps';
import featureText from './issue-type-filter.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background, AfterScenario }) => {
  Background(() => {
    const ctx = setupBackground();
    setBoardContext(ctx);
  });

  AfterScenario(() => {
    cleanupBoard();
  });
});
