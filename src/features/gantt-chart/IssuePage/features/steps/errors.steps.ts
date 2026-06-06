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

Given(/^the first fetch of linked subtasks will fail with "([^"]*)" then succeed$/, (message: string) => {
  ganttDisplayBddCtx.fetchSubtasksMode = 'ok';
  ganttDisplayBddCtx.fetchSubtasksErrorMessage = message;
  ganttDisplayBddCtx.fetchSubtasksFailFirstThenOk = true;
});

/** ERR-4: first request fails with `a`, first retry fails with `b`. */
Given(
  /^the API will fail the first fetch with "([^"]*)" and the second fetch with "([^"]*)"$/,
  (a: string, b: string) => {
    ganttDisplayBddCtx.fetchSubtasksErrorSequence = [a, b];
    ganttDisplayBddCtx.fetchSubtasksMode = 'ok';
  }
);

/** ERR-3: first load fails; retry succeeds after {@link ganttDisplayBddCtx.fetchSubtasksSuccessDelayMs}. */
Given('the Gantt subtask fetch was configured to succeed after a visible loading delay on retry', () => {
  ganttDisplayBddCtx.fetchSubtasksMode = 'ok';
  ganttDisplayBddCtx.fetchSubtasksFailFirstThenOk = true;
  ganttDisplayBddCtx.fetchSubtasksErrorMessage = 'Request timeout';
  ganttDisplayBddCtx.fetchSubtasksSuccessDelayMs = 400;
});

Then(/^I should see error state with message "([^"]*)"$/, (message: string) => {
  cy.contains('pre', message).should('be.visible');
});

Then(/^I should see "([^"]*)" button$/, (text: string) => {
  cy.contains('button', text).should('be.visible');
});

Then('I should see a loading indicator on the Gantt panel', () => {
  cy.get('[data-testid="gantt-chart-loading"]', { timeout: 10000 }).should('exist');
});

Then('I should not see the Gantt error state', () => {
  cy.get('[data-testid="gantt-chart-error-state"]').should('not.exist');
});
