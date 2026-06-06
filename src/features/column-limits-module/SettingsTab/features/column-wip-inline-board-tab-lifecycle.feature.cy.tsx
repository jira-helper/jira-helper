/// <reference types="cypress" />
import { defineFeature } from 'cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './column-wip-inline-board-tab-lifecycle.feature?raw';
import 'cypress/support/gherkin-steps/common';
import './steps/board-tab.steps';
import '../../SettingsPage/features/steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
