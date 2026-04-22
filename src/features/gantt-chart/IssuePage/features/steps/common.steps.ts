import { Given, type DataTableRows, Then, When } from '../../../../../../cypress/support/bdd-runner';
import {
  applyGanttSettingsTable,
  ganttDisplayBddCtx,
  issueFromRow,
  mergeColorRulesIntoCurrentGanttStorage,
  mountIssueViewWithGantt,
} from '../helpers';

Given(
  /^the issue "([^"]*)" of type "([^"]*)" in project "([^"]*)" has these linked issues:$/,
  (issueKey: string, _issueType: string, projectKey: string, table: DataTableRows) => {
    ganttDisplayBddCtx.scenarioIssueKey = issueKey;
    ganttDisplayBddCtx.scenarioProjectKey = projectKey;
    ganttDisplayBddCtx.mockSubtasks = table.map(row => issueFromRow(row));
  }
);

Given(/^Gantt settings are configured with:$/, (table: DataTableRows) => {
  applyGanttSettingsTable(table);
});

Given(/^color rules are configured:$/, (table: DataTableRows) => {
  mergeColorRulesIntoCurrentGanttStorage(table);
});

Given('today is {string}', (isoDate: string) => {
  cy.clock(new Date(`${isoDate}T12:00:00.000Z`).getTime(), ['Date']);
});

When('the issue view page has loaded', () => {
  mountIssueViewWithGantt({ withIssueDetails: true });
});

When('the Gantt chart is rendered', () => {
  mountIssueViewWithGantt({ withIssueDetails: false });
});

When('I expand the collapsible section', () => {
  cy.get('[data-testid="gantt-missing-dates"]').find('.ant-collapse-header').click();
});

Then('I should see the Gantt chart below the issue details block', () => {
  cy.get('[data-testid="issue-details-block"]').should('be.visible');
  cy.get('[data-testid="gantt-chart-svg"]').should('be.visible');
  cy.get('[data-testid="issue-details-block"]').then($details => {
    cy.get('[data-testid="gantt-chart-svg"]').then($chart => {
      const d = $details[0].getBoundingClientRect();
      const c = $chart[0].getBoundingClientRect();
      expect(c.top).to.be.at.least(d.bottom - 1);
    });
  });
});

Then(/^I should see bars for these issues:$/, (table: DataTableRows) => {
  for (const row of table) {
    const bar = cy.get(`[data-issue-key="${row.key}"]`);
    bar.should('exist');
    if (row.label) {
      bar.should('contain.text', row.label);
    }
    if (row.startDate && row.endDate) {
      bar.should($el => {
        const start = $el.attr('data-start-iso') ?? '';
        const end = $el.attr('data-end-iso') ?? '';
        expect(start.slice(0, 10)).to.eq(row.startDate);
        expect(end.slice(0, 10)).to.eq(row.endDate);
      });
    }
  }
});

Then('I should see a bar for {string} from {string} to {string}', (key: string, startDay: string, endDay: string) => {
  cy.get(`[data-issue-key="${key}"]`).should($el => {
    const start = $el.attr('data-start-iso') ?? '';
    const end = $el.attr('data-end-iso') ?? '';
    expect(start.slice(0, 10)).to.eq(startDay);
    expect(end.slice(0, 10)).to.eq(endDay);
  });
});

Then('I should see a bar for {string} on the chart', (key: string) => {
  cy.get(`[data-issue-key="${key}"]`).should('exist');
});

Then('I should see a bar for {string} on the chart with a warning icon', (key: string) => {
  cy.get(`[data-issue-key="${key}"]`).should('exist').find('[data-testid="gantt-bar-open-ended"]').should('exist');
});

Then('I should not see a bar for {string} on the chart', (key: string) => {
  cy.get(`[data-issue-key="${key}"]`).should('not.exist');
});

Then('the bar for {string} should have a warning icon on the right end', (key: string) => {
  cy.get(`[data-issue-key="${key}"]`).find('[data-testid="gantt-bar-open-ended"]').should('exist');
});

Then('the bar for {string} should not have a warning icon', (key: string) => {
  cy.get(`[data-issue-key="${key}"]`).find('[data-testid="gantt-bar-open-ended"]').should('not.exist');
});

Then('the bar for {string} should have fill color {string}', (key: string, color: string) => {
  cy.get(`[data-issue-key="${key}"]`)
    .find('[data-bar-rect="true"]')
    .should($el => {
      expect($el.attr('fill')).to.eq(color);
    });
});

Then('the bar for {string} should have default category fill color', (key: string) => {
  cy.get(`[data-issue-key="${key}"]`)
    .find('[data-bar-rect="true"]')
    .should($el => {
      expect($el.attr('fill')).to.eq('#DFE1E6');
    });
});

Then('I should see collapsible section {string}', (title: string) => {
  cy.get('[data-testid="gantt-missing-dates"]').should('contain.text', title);
});

Then(/^I should see these missing issues:$/, (table: DataTableRows) => {
  for (const row of table) {
    cy.contains('tr', row.key).should('be.visible');
    cy.contains('tr', row.key).should('contain.text', row.summary);
    cy.contains('tr', row.key).should('contain.text', row.reason);
  }
});
