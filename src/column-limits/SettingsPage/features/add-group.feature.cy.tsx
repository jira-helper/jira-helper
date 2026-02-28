/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './add-group.feature?raw';
import './steps/common.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
