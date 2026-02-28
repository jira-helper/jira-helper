/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './edge-cases.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
