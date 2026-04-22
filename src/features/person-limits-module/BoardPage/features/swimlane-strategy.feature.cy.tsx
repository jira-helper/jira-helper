/// <reference types="cypress" />
/**
 * Cypress Component Tests: Person Limits BoardPage - Swimlane Strategy
 *
 * Verifies that limit application on the board respects the board's swimlaneStrategy:
 *  - non-"custom" → saved swimlane filter on a limit is ignored, so limits keep working
 *    when admin switches the board to "none" / "epic" / "assignee" / "parentChild";
 *  - "custom" → saved swimlane filter is honored as before (regression guard).
 */
import { defineFeature } from 'cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './swimlane-strategy.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
