import { And, Given, type DataTableRows, Then, When } from '../../../../../../cypress/support/bdd-runner';
import type { DateMapping, GanttScopeSettings } from '../../../types';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../../models/GanttSettingsModel';
import {
  applyGanttScopesTable,
  ganttDisplayBddCtx,
  mountIssueViewWithGantt,
  parseDateMapping,
  parseDateMappings,
  setPersistedPreferredScopeLevel,
} from '../helpers';

const { expect } = chai;

Given('no Gantt settings exist in storage', () => {
  localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
});

Given(/^these Gantt scopes exist in storage:$/, (table: DataTableRows) => {
  applyGanttScopesTable(table);
});

Given(
  /^I opened issue view for issue "([^"]*)" of type "([^"]*)" in project "([^"]*)"$/,
  (issueKey: string, issueType: string, projectKey: string) => {
    ganttDisplayBddCtx.scenarioIssueKey = issueKey;
    ganttDisplayBddCtx.scenarioProjectKey = projectKey;
    ganttDisplayBddCtx.scenarioIssueType = issueType;
    mountIssueViewWithGantt({ withIssueDetails: true });
  }
);

function applyChangelog(issueKey: string, table: DataTableRows, opts: { withCategory: boolean }): void {
  const issue = ganttDisplayBddCtx.mockSubtasks.find(i => i.key === issueKey);
  if (!issue) {
    throw new Error(`Unknown linked issue ${issueKey}; define linked issues before changelog.`);
  }
  issue.changelog = {
    startAt: 0,
    maxResults: table.length,
    total: table.length,
    histories: table.map(row => ({
      created: row.timestamp,
      items: [
        {
          field: 'status',
          fieldtype: 'jira',
          from: null,
          to: null,
          fromString: row.fromStatus,
          toString: row.toStatus,
          ...(opts.withCategory
            ? {
                fromStatusCategory: { key: row.fromCategory },
                toStatusCategory: { key: row.toCategory },
              }
            : {}),
        },
      ],
    })),
  };
}

Given(/^the changelog for "([^"]*)" contains these status transitions:$/, (issueKey: string, table: DataTableRows) => {
  applyChangelog(issueKey, table, { withCategory: true });
});

Given(
  /^the changelog for "([^"]*)" contains these status transitions without category metadata:$/,
  (issueKey: string, table: DataTableRows) => {
    applyChangelog(issueKey, table, { withCategory: false });
  }
);

Given(/^the persisted preferredScopeLevel is "([^"]*)"$/, (level: string) => {
  if (level !== 'global' && level !== 'project' && level !== 'projectIssueType') {
    throw new Error(`Unsupported preferredScopeLevel: ${level}`);
  }
  setPersistedPreferredScopeLevel(level);
});

When('I open Gantt settings from the gear button', () => {
  cy.contains('button', 'Gantt settings').click();
});

Then(/^I should see first-run message "([^"]*)"$/, (message: string) => {
  cy.contains(message).should('be.visible');
});

Then(/^I should see "([^"]*)" button$/, (label: string) => {
  cy.contains('button', label).should('be.visible');
});

Then('I should not see any Gantt bars', () => {
  cy.get('[data-issue-key]').should('not.exist');
});

Then('I should see the Gantt settings dialog', () => {
  cy.get('[role="dialog"]').should('be.visible').and('contain', 'Gantt settings');
});

const SCOPE_LABEL_TO_VALUE: Record<string, string> = {
  Global: 'global',
  Project: 'project',
  'Project + issue type': 'projectIssueType',
};

When(/^I select scope "([^"]*)"$/, (label: string) => {
  const value = SCOPE_LABEL_TO_VALUE[label];
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      if (value) {
        cy.get(`input[type="radio"][value="${value}"]`).click({ force: true });
      } else {
        cy.contains('label', label).click();
      }
    });
});

When('I click "Copy from…"', () => {
  cy.contains('button', 'Copy from…').click();
});

When(/^I choose to copy from "([^"]*)"$/, (scopeLabel: string) => {
  cy.get('[role="dialog"]')
    .filter(':visible')
    .last()
    .within(() => {
      cy.contains('.ant-radio-wrapper', scopeLabel).click();
    });
});

When('I confirm copy', () => {
  cy.get('[role="dialog"]')
    .filter(':visible')
    .last()
    .within(() => {
      cy.contains('button', 'Copy').click();
    });
});

function expectMapping(actual: DateMapping, cell: string): void {
  expect(actual).to.deep.equal(parseDateMapping(cell));
}

function expectMappings(actual: DateMapping[], cell: string): void {
  expect(actual).to.deep.equal(parseDateMappings(cell));
}

function readScopeFromStorage(raw: string | null, scopeKey: string): GanttScopeSettings {
  expect(raw, 'localStorage value').to.be.a('string');
  const parsed = JSON.parse(raw!) as { storage: Record<string, GanttScopeSettings> };
  const settings = parsed.storage[scopeKey];
  expect(settings, `scope ${scopeKey}`).to.be.an('object');
  return settings;
}

function assertScopeTable(storageKey: string, scopeKey: string, table: DataTableRows): void {
  cy.window().should(win => {
    const raw = win.localStorage.getItem(storageKey);
    const settings = readScopeFromStorage(raw, scopeKey);
    for (const row of table) {
      if (row.setting === 'startMapping') {
        expectMapping(settings.startMappings[0], row.value);
      } else if (row.setting === 'endMapping') {
        expectMapping(settings.endMappings[0], row.value);
      } else if (row.setting === 'startMappings') {
        expectMappings(settings.startMappings, row.value);
      } else if (row.setting === 'endMappings') {
        expectMappings(settings.endMappings, row.value);
      } else {
        throw new Error(`Unsupported setting assertion: ${row.setting}`);
      }
    }
  });
}

Then(
  /^localStorage key "([^"]*)" should contain scope "([^"]*)" with:$/,
  (storageKey: string, scopeKey: string, table: DataTableRows) => {
    assertScopeTable(storageKey, scopeKey, table);
  }
);

And(
  /^localStorage key "([^"]*)" should still contain scope "([^"]*)" with:$/,
  (storageKey: string, scopeKey: string, table: DataTableRows) => {
    assertScopeTable(storageKey, scopeKey, table);
  }
);

Then(/^the settings form should show:$/, (table: DataTableRows) => {
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      const map = Object.fromEntries(table.map(r => [r.setting, r.value])) as Record<string, string>;
      if (map.startMapping) {
        const m = map.startMapping;
        if (m.startsWith('dateField:')) {
          cy.get('.ant-select').eq(0).should('contain.text', 'Date field');
          cy.get('input.ant-input')
            .eq(0)
            .should('have.value', m.replace(/^dateField:\s*/i, '').trim());
        } else if (m.startsWith('statusTransition:')) {
          cy.get('.ant-select').eq(0).should('contain.text', 'Status transition');
          cy.get('input.ant-input')
            .eq(0)
            .should('have.value', m.replace(/^statusTransition:\s*/i, '').trim());
        }
      }
      if (map.endMapping) {
        const m = map.endMapping;
        if (m.startsWith('dateField:')) {
          cy.get('.ant-select').eq(1).should('contain.text', 'Date field');
          cy.get('input.ant-input')
            .eq(1)
            .should('have.value', m.replace(/^dateField:\s*/i, '').trim());
        } else if (m.startsWith('statusTransition:')) {
          cy.get('.ant-select').eq(1).should('contain.text', 'Status transition');
          cy.get('input.ant-input')
            .eq(1)
            .should('have.value', m.replace(/^statusTransition:\s*/i, '').trim());
        }
      }
    });
});

When(/^I change start mapping to "([^"]*)" with field "([^"]*)"$/, (sourceLabel: string, fieldValue: string) => {
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.get('.ant-select').eq(0).click();
    });
  cy.contains('.ant-select-item-option', sourceLabel).should('be.visible').click();
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.get('input.ant-input').eq(0).clear();
      cy.get('input.ant-input').eq(0).type(fieldValue);
    });
});

const SCOPE_VALUE_TO_LABEL: Record<string, string> = {
  Global: 'Global',
  Project: 'This project',
  'Project + issue type': 'This project + issue type',
};

Then(/^the scope picker should show "([^"]*)" selected$/, (label: string) => {
  const labelText = SCOPE_VALUE_TO_LABEL[label] ?? label;
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.contains('.ant-segmented-item-selected', labelText).should('exist');
    });
});

When(
  /^I add a fallback row to "([^"]*)" with "([^"]*)" and value "([^"]*)"$/,
  (sectionLabel: string, sourceLabel: string, fieldValue: string) => {
    cy.get('[role="dialog"]')
      .filter(':visible')
      .first()
      .within(() => {
        cy.contains('h4, .ant-typography', sectionLabel)
          .parents('.ant-form-item, section, div')
          .first()
          .within(() => {
            cy.contains('button', /Add fallback|Добавить/i).click();
            cy.get('.ant-select').last().click();
          });
      });
    cy.contains('.ant-select-item-option', sourceLabel).should('be.visible').click();
    cy.get('[role="dialog"]')
      .filter(':visible')
      .first()
      .within(() => {
        cy.contains('h4, .ant-typography', sectionLabel)
          .parents('.ant-form-item, section, div')
          .first()
          .within(() => {
            cy.get('input.ant-input').last().clear();
            cy.get('input.ant-input').last().type(fieldValue);
          });
      });
  }
);
