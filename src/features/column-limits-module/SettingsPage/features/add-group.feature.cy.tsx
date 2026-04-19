/// <reference types="cypress" />
import { defineFeature } from 'cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './add-group.feature?raw';
import 'cypress/support/gherkin-steps/common';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
