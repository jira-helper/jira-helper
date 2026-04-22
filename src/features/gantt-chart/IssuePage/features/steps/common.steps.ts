import { Given, type DataTableRows, Then, When } from '../../../../../../cypress/support/bdd-runner';

const { expect } = chai;
import {
  addChangelogTransitionsCoveringBarWindow,
  applyEmptyLinkTypeInclusion,
  applyExclusionFiltersTable,
  applyGanttSettingsTable,
  applyLinkTypeInclusionTable,
  ganttDisplayBddCtx,
  issueFromRow,
  mergeColorRulesIntoCurrentGanttStorage,
  mountIssueViewWithGantt,
  triggerChartRerender,
  updateMockSubtaskField,
} from '../helpers';

Given(
  /^the issue "([^"]*)" of type "([^"]*)" in project "([^"]*)" has these linked issues:$/,
  (issueKey: string, issueType: string, projectKey: string, table: DataTableRows) => {
    ganttDisplayBddCtx.scenarioIssueKey = issueKey;
    ganttDisplayBddCtx.scenarioProjectKey = projectKey;
    ganttDisplayBddCtx.scenarioIssueType = issueType;
    ganttDisplayBddCtx.mockSubtasks = table.map(row => issueFromRow(row));
  }
);

/** Clears changelog on a mock issue via JSON round-trip so the row cannot retain hidden/shared changelog state. */
Given(/^the changelog for "([^"]*)" has no status transitions inside its bar window$/, (issueKey: string) => {
  const ix = ganttDisplayBddCtx.mockSubtasks.findIndex(i => i.key === issueKey);
  if (ix === -1) {
    throw new Error(`Unknown linked issue ${issueKey}; define linked issues before changelog.`);
  }
  const clone = JSON.parse(
    JSON.stringify(ganttDisplayBddCtx.mockSubtasks[ix]!)
  ) as (typeof ganttDisplayBddCtx.mockSubtasks)[number];
  delete clone.changelog;
  ganttDisplayBddCtx.mockSubtasks[ix] = clone;
});

Given(
  /^the issue "([^"]*)" of type "([^"]*)" in project "([^"]*)" has no linked issues$/,
  (issueKey: string, issueType: string, projectKey: string) => {
    ganttDisplayBddCtx.scenarioIssueKey = issueKey;
    ganttDisplayBddCtx.scenarioProjectKey = projectKey;
    ganttDisplayBddCtx.scenarioIssueType = issueType;
    ganttDisplayBddCtx.mockSubtasks = [];
  }
);

Given(/^Gantt settings are configured with:$/, (table: DataTableRows) => {
  applyGanttSettingsTable(table);
});

Given(/^color rules are configured:$/, (table: DataTableRows) => {
  mergeColorRulesIntoCurrentGanttStorage(table);
});

Given(/^exclusion filters are configured as:$/, (table: DataTableRows) => {
  applyExclusionFiltersTable(table);
});

Given(/^issue link type inclusion is configured as:$/, (table: DataTableRows) => {
  applyLinkTypeInclusionTable(table);
});

Given(/^issue link type inclusion is configured as empty list$/, () => {
  applyEmptyLinkTypeInclusion();
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
  cy.get('[data-testid="gantt-missing-dates-toggle"]').click();
});

Then('I should see the Gantt chart below the issue details block', () => {
  cy.get('[data-testid="gantt-chart-svg"]').should('be.visible');
});

Then(/^I should see bars with these labels:$/, (table: DataTableRows) => {
  for (const row of table) {
    cy.get(`[data-issue-key="${row.key}"]`).should('contain.text', row.label);
  }
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
        const rs = row.startDate;
        const re = row.endDate;
        if (rs.includes('T') || re.includes('T')) {
          expect(start.slice(0, 19)).to.eq(rs.slice(0, 19));
          expect(end.slice(0, 19)).to.eq(re.slice(0, 19));
        } else {
          expect(start.slice(0, 10)).to.eq(rs.slice(0, 10));
          expect(end.slice(0, 10)).to.eq(re.slice(0, 10));
        }
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

Then(/^I should see "([^"]*)" button$/, (label: string) => {
  cy.contains('button', label).should('be.visible');
});

Then('I should not see any Gantt bars', () => {
  cy.get('[data-issue-key]').should('not.exist');
});

Then(/^I should see empty state message "([^"]*)"$/, (message: string) => {
  cy.get('[data-testid="gantt-empty-state"]', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="gantt-empty-state"]').should('contain.text', message);
});

Then('I should see {int} issues in the missing-dates section', (count: number) => {
  const n = Number(count);
  cy.get('[data-testid="gantt-missing-dates-toggle"]').should($el => {
    const t = $el.text();
    if (n === 1) {
      expect(/1 issues? not shown/i.test(t), t).to.be.true;
    } else {
      expect(t).to.contain(`${n} issues not shown`);
    }
  });
});

Then('I should see collapsible section {string}', (title: string) => {
  cy.get('[data-testid="gantt-missing-dates"]').should('contain.text', title);
});

Then(/^I should see these missing issues:$/, (table: DataTableRows) => {
  for (const row of table) {
    cy.get('[data-testid="gantt-missing-dates"] tbody tr')
      .filter((_, el) => (el as HTMLElement).innerText.includes(row.key))
      .first()
      .should('be.visible')
      .should('contain.text', row.summary)
      .should('contain.text', row.reason);
  }
});

function toolbarWarningTestIdForTagText(
  text: string
): 'gantt-toolbar-warning-no-history' | 'gantt-toolbar-warning-missing-dates' {
  if (text.includes('not on chart')) {
    return 'gantt-toolbar-warning-missing-dates';
  }
  if (text.toLowerCase().includes('no history')) {
    return 'gantt-toolbar-warning-no-history';
  }
  throw new Error(`Cannot infer warning tag type from label: ${text}`);
}

Then(/^I should see a yellow warning tag "([^"]*)" in the Gantt toolbar$/, (text: string) => {
  const testId = toolbarWarningTestIdForTagText(text);
  // Wait for the loaded chart shell first — avoids racing cy.mount / async load with a 4s default timeout.
  cy.get('[data-testid="gantt-chart-body"]', { timeout: 20000 }).should('be.visible');
  if (testId === 'gantt-toolbar-warning-no-history') {
    cy.get('[data-testid="gantt-status-breakdown-toggle"]', { timeout: 20000 }).should(
      'have.class',
      'ant-switch-checked'
    );
  }
  if (testId === 'gantt-toolbar-warning-missing-dates') {
    cy.get('[data-testid="gantt-missing-dates"]', { timeout: 20000 }).should('exist');
  }
  cy.get(`[data-testid="${testId}"]`, { timeout: 20000 }).should('be.visible').and('contain', text);
});

Then('the tag is keyboard-focusable and uses a help cursor', () => {
  cy.get('[data-testid="gantt-toolbar-warning-no-history"], [data-testid="gantt-toolbar-warning-missing-dates"]')
    .filter(':visible')
    .should('have.length', 1)
    .first()
    .find('[role="status"]')
    .should('have.attr', 'tabindex', '0')
    .then($el => {
      expect(getComputedStyle($el[0]).cursor).to.eq('help');
    });
});

When(/^I hover or focus the "([^"]*)" tag$/, (label: string) => {
  const testId = toolbarWarningTestIdForTagText(label);
  cy.get(`[data-testid="${testId}"]`).should('contain', label).find('[role="status"]').trigger('mouseenter').focus();
});

Then(/^a tooltip with the heading "([^"]*)" appears$/, (heading: string) => {
  cy.get('[data-testid="gantt-warning-tooltip"]', { timeout: 15000 })
    .should('be.visible')
    .find('[data-testid="gantt-warning-tooltip-heading"]')
    .should('contain', heading);
});

Then(/^the tooltip lists these tasks in an Issue \/ Summary table:$/, (table: DataTableRows) => {
  // Re-query the tooltip for each row: reusing one cy chain + .find in a loop chains the 2nd find off the first <tr>.
  cy.get('[data-testid="gantt-warning-tooltip"][data-warning-type="no-history"]', { timeout: 15000 }).within(() => {
    for (const row of table) {
      cy.get(`[data-testid="gantt-warning-tooltip-row"][data-issue-key="${row.key}"]`)
        .should('be.visible')
        .should('contain.text', row.summary);
    }
  });
});

Then(/^the tooltip lists these issues in an Issue \/ Summary \/ Reason table:$/, (table: DataTableRows) => {
  cy.get('[data-testid="gantt-warning-tooltip"][data-warning-type="missing-dates"]', { timeout: 15000 }).within(() => {
    for (const row of table) {
      cy.get(`[data-testid="gantt-warning-tooltip-row"][data-issue-key="${row.key}"]`)
        .should('be.visible')
        .should('contain.text', row.summary)
        .should('contain.text', row.reason);
    }
  });
});

When(/^the changelog for "([^"]*)" gains status transitions covering its bar window$/, (issueKey: string) => {
  // Must run on the Cypress command queue: bdd-runner invokes all step callbacks synchronously
  // before cy.mount / fetchSubtasks; defer so "gains changelog" runs after the chart has loaded.
  cy.then(() => {
    addChangelogTransitionsCoveringBarWindow(issueKey);
    triggerChartRerender();
  });
});

When(/^the changelog for "([^"]*)" also gains status transitions covering its bar window$/, (issueKey: string) => {
  cy.then(() => {
    addChangelogTransitionsCoveringBarWindow(issueKey);
    triggerChartRerender();
  });
});

When(
  /^"([^"]*)" gains a resolvable start date so that only "([^"]*)" remains without dates$/,
  (gainKey: string, remainsKey: string) => {
    cy.then(() => {
      if (gainKey === 'PROJ-2503' && remainsKey === 'PROJ-2502') {
        updateMockSubtaskField('PROJ-2503', { created: '2026-04-08' });
        return;
      }
      throw new Error(`Unsupported BDD step pair: ${gainKey} / ${remainsKey}`);
    });
  }
);

When('every linked issue has resolvable start and end dates', () => {
  cy.then(() => {
    for (const issue of ganttDisplayBddCtx.mockSubtasks) {
      const f = issue.fields as { created?: string; duedate?: string };
      if (!f.created) {
        f.created = '2026-04-02';
      }
      if (!f.duedate) {
        f.duedate = '2026-04-18';
      }
    }
  });
});

When('the Gantt chart is rendered again', () => {
  triggerChartRerender();
});

Then(/^I should not see any "No history" tag in the Gantt toolbar$/, () => {
  cy.get('[data-testid="gantt-toolbar-warning-no-history"]').should('not.exist');
});

Then(/^I should not see any "not on chart" tag in the Gantt toolbar$/, () => {
  cy.get('[data-testid="gantt-toolbar-warning-missing-dates"]').should('not.exist');
});
