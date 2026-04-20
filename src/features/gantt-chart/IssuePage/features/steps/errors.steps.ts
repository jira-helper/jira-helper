import { Given, Then } from '../../../../../../cypress/support/bdd-runner';
import { ganttDisplayBddCtx } from '../helpers';

Given(
  /^the issue "([^"]*)" of type "([^"]*)" in project "([^"]*)" exists$/,
  (issueKey: string, _issueType: string, projectKey: string) => {
    ganttDisplayBddCtx.scenarioIssueKey = issueKey;
    ganttDisplayBddCtx.scenarioProjectKey = projectKey;
    ganttDisplayBddCtx.mockSubtasks = [];
  }
);

Given(/^the API request to fetch linked subtasks will fail with error "([^"]*)"$/, (message: string) => {
  ganttDisplayBddCtx.fetchSubtasksMode = 'err';
  ganttDisplayBddCtx.fetchSubtasksErrorMessage = message;
});

Then(/^I should see error state with message "([^"]*)"$/, (message: string) => {
  cy.contains('pre', message).should('be.visible');
});

Then('I should not see any Gantt bars', () => {
  cy.get('[data-issue-key]').should('not.exist');
});
