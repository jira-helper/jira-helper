/// <reference types="cypress" />
import { defineFeature } from '../../../cypress/support/bdd-runner';
import featureText from '../../../.agents/tasks/jira-comment-templates/comment-templates.feature?raw';
import 'cypress/support/gherkin-steps/common';
import { setupBackground } from './CommentTemplates.steps';
import './CommentTemplates.steps';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
