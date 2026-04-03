/**
 * Common step definitions for Person Limits BoardPage display tests.
 */
import { Given, When, Then, And, type DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { columns, swimlanes, mockPageObjectRef, mountComponent } from '../helpers';
import { usePersonWipLimitsPropertyStore } from '../../../property';
import { applyLimits } from '../../actions';

function toDisplayName(login: string): string {
  return login
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseColumnIds(columnsStr: string): Array<{ id: string; name: string }> {
  if (!columnsStr.trim()) return [];
  return columnsStr
    .split(',')
    .map(s => s.trim())
    .map(id => {
      const col = columns.find(c => c.id === id || c.name === id);
      return col ? { id: col.id, name: col.name } : { id, name: id };
    });
}

function parseSwimlaneIds(swimlanesStr: string): Array<{ id: string; name: string }> {
  if (!swimlanesStr.trim()) return [];
  return swimlanesStr
    .split(',')
    .map(s => s.trim())
    .map(id => {
      const sw = swimlanes.find(s => s.id === id || s.name === id);
      return sw ? { id: sw.id, name: sw.name } : { id, name: id };
    });
}

function parseIssueTypes(issueTypesStr: string): string[] | undefined {
  if (!issueTypesStr.trim()) return undefined;
  const types = issueTypesStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return types.length > 0 ? types : undefined;
}

function createPersonLimit(
  person: string,
  displayName: string,
  limit: number,
  limitColumns: Array<{ id: string; name: string }>,
  limitSwimlanes: Array<{ id: string; name: string }>,
  includedIssueTypes?: string[],
  showAllPersonIssues: boolean = true
) {
  return {
    id: 0,
    person: {
      name: person,
      displayName: displayName || toDisplayName(person),
      self: '',
      avatar: `https://avatar.example.com/${person}`,
    },
    limit,
    columns: limitColumns,
    swimlanes: limitSwimlanes,
    includedIssueTypes,
    showAllPersonIssues,
  };
}

function parseOrdinalToIndex(ordinal: string): number {
  const map: Record<string, number> = {
    '1st': 0,
    first: 0,
    '2nd': 1,
    second: 1,
    '3rd': 2,
    third: 2,
    '4th': 3,
    fourth: 3,
    '5th': 4,
    fifth: 4,
  };
  const idx = map[ordinal.toLowerCase()];
  if (idx === undefined) throw new Error(`Unknown ordinal: ${ordinal}`);
  return idx;
}

// --- Given steps ---

Given('there are no WIP limits configured', () => {
  cy.then(() => {
    usePersonWipLimitsPropertyStore.getState().actions.setLimits([]);
  });
});

Given('there are issues on the board', () => {
  cy.then(() => {
    const mock = mockPageObjectRef.current;
    if (!mock) throw new Error('No mock PageObject - setupBackground may not have run');
    for (let i = 0; i < 3; i++) {
      mock.addIssue(`issue-anonymous-${i}`, 'anonymous.user', 'col2', 'Task', null);
    }
  });
});

Given('there are WIP limits:', (dataTable: DataTableRows) => {
  cy.then(() => {
    const { limits } = usePersonWipLimitsPropertyStore.getState().data;
    const newLimits = dataTable.map(row => {
      const person = row.person ?? '';
      const personDisplayName = row.personDisplayName ?? toDisplayName(person);
      const limit = parseInt(row.limit ?? '0', 10);
      const limitColumns = parseColumnIds(row.columns ?? '');
      const limitSwimlanes = parseSwimlaneIds(row.swimlanes ?? '');
      const includedIssueTypes = parseIssueTypes(row.issueTypes ?? '');
      const showAllPersonIssues = row.showAllPersonIssues != null ? row.showAllPersonIssues !== 'false' : true;
      return createPersonLimit(
        person,
        personDisplayName,
        limit,
        limitColumns,
        limitSwimlanes,
        includedIssueTypes,
        showAllPersonIssues
      );
    });
    usePersonWipLimitsPropertyStore.getState().actions.setLimits([...limits, ...newLimits]);
  });
});

Given('the board has issues:', (dataTable: DataTableRows) => {
  cy.then(() => {
    const mock = mockPageObjectRef.current;
    if (!mock) throw new Error('No mock PageObject - setupBackground may not have run');
    dataTable.forEach((row, idx) => {
      const id = row.id ?? `issue-${row.person ?? ''}-${row.column ?? ''}-${idx}`;
      const person = row.person ?? '';
      const personDisplayName = row.personDisplayName?.trim();
      const assignee = personDisplayName || person;
      const column = row.column ?? row.column;
      const swimlane = row.swimlane ?? row.swimlane;
      const issueType = row.issueType ?? row.issueType ?? 'Task';
      mock.addIssue(id, assignee, column, issueType, swimlane === '' ? null : swimlane);
    });
  });
});

// --- When steps ---

When('the board is displayed', () => {
  cy.then(() => {
    applyLimits();
  });
  mountComponent();
});

When(/^I click on "([^"]*)" avatar$/, (person: string) => {
  cy.get(`[data-person-name="${person}"]`).first().click();
  cy.wait(100); // Wait for showOnlyChosen (setTimeout)
});

When(/^I click on the (first|second|1st|2nd) "([^"]*)" avatar$/, (ordinal: string, person: string) => {
  const index = parseOrdinalToIndex(ordinal);
  cy.get(`[data-person-name="${person}"]`).eq(index).click();
  cy.wait(100);
});

// --- Then steps ---

Then('no WIP limit counters should be visible', () => {
  cy.get('#avatars-limits', { timeout: 0 }).should('not.exist');
});

Then(/^the counter for "([^"]*)" should show "([^"]*)"$/, (person: string, expectedText: string) => {
  cy.get(`[data-person-name="${person}"]`).should('contain.text', expectedText);
});

Then(/^the counter for "([^"]*)" should be (green|yellow|red)$/, (person: string, color: string) => {
  const statusMap: Record<string, string> = {
    green: 'under',
    yellow: 'at',
    red: 'over',
  };
  const expectedStatus = statusMap[color];
  cy.get(`[data-person-name="${person}"]`).find(`[data-status="${expectedStatus}"]`).should('exist');
});

Then(/^all (\d+) issues for "([^"]*)" should be highlighted red$/, (countStr: string, person: string) => {
  const expectedCount = parseInt(countStr, 10);
  cy.then(() => {
    const mock = mockPageObjectRef.current;
    if (!mock || !('getHighlightedIssues' in mock)) {
      throw new Error('Mock PageObject has no getHighlightedIssues');
    }
    const { limits } = usePersonWipLimitsPropertyStore.getState().data;
    const limit = limits.find(l => l.person.name === person);
    const expectedDisplayName = limit?.person.displayName;
    const highlighted = mock.getHighlightedIssues();
    expect(highlighted).to.have.length(expectedCount);
    highlighted.forEach(issue => {
      const assignee = mock.getAssigneeFromIssue(issue);
      const matches = assignee === person || (expectedDisplayName != null && assignee === expectedDisplayName);
      if (!matches) {
        throw new Error(`Expected assignee to match ${person} or ${expectedDisplayName}, got ${assignee}`);
      }
    });
  });
});

Then(
  /^the (1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth) counter for "([^"]*)" should show "([^"]*)" and be (green|yellow|red)$/,
  (ordinal: string, person: string, expectedText: string, color: string) => {
    const index = parseOrdinalToIndex(ordinal);
    const statusMap: Record<string, string> = {
      green: 'under',
      yellow: 'at',
      red: 'over',
    };
    cy.get(`[data-person-name="${person}"]`)
      .eq(index)
      .should('contain.text', expectedText)
      .find(`[data-status="${statusMap[color]}"]`)
      .should('exist');
  }
);

And(
  /^the (1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth) counter for "([^"]*)" should show "([^"]*)" and be (green|yellow|red)$/,
  (ordinal: string, person: string, expectedText: string, color: string) => {
    const index = parseOrdinalToIndex(ordinal);
    const statusMap: Record<string, string> = {
      green: 'under',
      yellow: 'at',
      red: 'over',
    };
    cy.get(`[data-person-name="${person}"]`)
      .eq(index)
      .should('contain.text', expectedText)
      .find(`[data-status="${statusMap[color]}"]`)
      .should('exist');
  }
);

// --- Interaction steps ---

Then(/^issue "([^"]*)" should be visible$/, (issueId: string) => {
  cy.get(`[data-issue-id="${issueId}"]`).should('be.visible');
});

Then(/^issue "([^"]*)" should be hidden$/, (issueId: string) => {
  cy.get(`[data-issue-id="${issueId}"]`).should('not.be.visible');
});

Then('all issues should be visible', () => {
  cy.then(() => {
    const mock = mockPageObjectRef.current;
    if (!mock) throw new Error('No mock PageObject');
    const issues = mock.getIssues('.ghx-issue');
    issues.forEach(issue => {
      const id = (issue as HTMLElement).getAttribute('data-issue-id');
      if (id) cy.get(`[data-issue-id="${id}"]`).should('be.visible');
    });
  });
});

Then(/^only "([^"]*)" issues should be visible$/, (person: string) => {
  cy.then(() => {
    const mock = mockPageObjectRef.current;
    if (!mock) throw new Error('No mock PageObject');
    const { limits } = usePersonWipLimitsPropertyStore.getState().data;
    const limit = limits.find(l => l.person.name === person);
    const personDisplayName = limit?.person.displayName ?? toDisplayName(person);
    const issues = mock.getIssues('.ghx-issue');
    issues.forEach(issue => {
      const id = (issue as HTMLElement).getAttribute('data-issue-id');
      const assignee = mock.getAssigneeFromIssue(issue);
      const shouldBeVisible = assignee === person || assignee === personDisplayName;
      if (id) {
        if (shouldBeVisible) {
          cy.get(`[data-issue-id="${id}"]`).should('be.visible');
        } else {
          cy.get(`[data-issue-id="${id}"]`).should('not.be.visible');
        }
      }
    });
  });
});
