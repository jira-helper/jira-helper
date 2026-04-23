/**
 * Common step definitions for Personal WIP Limit Settings tests.
 *
 * These steps are reusable across multiple scenarios.
 */
import { globalContainer } from 'dioma';
import { Given, When, Then, type DataTableRows } from 'cypress/support/bdd-runner';
import { propertyModelToken, settingsUIModelToken } from '../../../tokens';
import { columns, swimlanes, mountSettingsButton, setSearchMockType, setActiveSwimlanes } from '../helpers';
import type { PersonLimit } from '../../state/types';

const getNextLimitId = () => Date.now() + Math.random();

function parseList(value: string): string[] {
  if (value === 'all') return [];
  return value.split(',').map(s => s.trim());
}

function findColumnsByNames(names: string[]): Array<{ id: string; name: string }> {
  return columns.filter(c => names.includes(c.name)).map(c => ({ id: c.id, name: c.name }));
}

function findSwimlanesByNames(names: string[]): Array<{ id: string; name: string }> {
  return swimlanes.filter(s => names.includes(s.name)).map(s => ({ id: s.id, name: s.name }));
}

function createPersonLimit(
  login: string,
  displayName: string,
  value: number,
  columnsStr: string,
  swimlanesStr: string,
  issueTypesStr: string,
  showAllPersonIssues: boolean = true
): PersonLimit {
  const colNames = parseList(columnsStr);
  const swimNames = parseList(swimlanesStr);
  const issueTypes = parseList(issueTypesStr);

  return {
    id: getNextLimitId(),
    persons: [{ name: login, displayName, self: '' }],
    limit: value,
    columns: findColumnsByNames(colNames),
    swimlanes: findSwimlanesByNames(swimNames),
    includedIssueTypes: issueTypes.length > 0 ? issueTypes : undefined,
    showAllPersonIssues,
  };
}

// --- Given steps ---

Given(
  /^a limit: login "([^"]*)" name "([^"]*)" value (\d+) columns "([^"]*)" swimlanes "([^"]*)" issueTypes "([^"]*)"$/,
  (
    login: string,
    displayName: string,
    value: string,
    columnsStr: string,
    swimlanesStr: string,
    issueTypesStr: string,
    dataTable?: DataTableRows
  ) => {
    const row = dataTable?.[0];
    const showAllPersonIssues = row?.showAllPersonIssues != null ? row.showAllPersonIssues !== 'false' : true;

    const limit = createPersonLimit(
      login,
      displayName,
      parseInt(value, 10),
      columnsStr,
      swimlanesStr,
      issueTypesStr,
      showAllPersonIssues
    );

    const propertyModel = globalContainer.inject(propertyModelToken).model;
    propertyModel.setLimits([...propertyModel.data.limits, limit]);
  }
);

Given(
  /^a limit with showAllPersonIssues disabled: login "([^"]*)" name "([^"]*)" value (\d+) columns "([^"]*)" swimlanes "([^"]*)" issueTypes "([^"]*)"$/,
  (
    login: string,
    displayName: string,
    value: string,
    columnsStr: string,
    swimlanesStr: string,
    issueTypesStr: string
  ) => {
    const limit = createPersonLimit(
      login,
      displayName,
      parseInt(value, 10),
      columnsStr,
      swimlanesStr,
      issueTypesStr,
      false
    );
    const propertyModel = globalContainer.inject(propertyModelToken).model;
    propertyModel.setLimits([...propertyModel.data.limits, limit]);
  }
);

Given('there are no limits configured', () => {
  globalContainer.inject(propertyModelToken).model.setData({ limits: [] });
  globalContainer.inject(settingsUIModelToken).model.reset();
});

// Mirrors SettingsPage/index.tsx: when board's swimlaneStrategy is not "custom",
// the modal is fed an empty swimlane list (saved query swimlanes are inert in that case).
Given('the board has no custom swimlanes', () => {
  setActiveSwimlanes([]);
});

Given('the board has custom swimlanes', () => {
  setActiveSwimlanes(swimlanes);
});

Given('search returns no users', () => {
  setSearchMockType('empty');
});

Given('search API fails', () => {
  setSearchMockType('error');
});

// --- When steps ---

When('I open the settings modal', () => {
  mountSettingsButton();
  cy.contains('button', 'Manage per-person WIP-limits').click();
  cy.get('[role="dialog"]').should('exist');
});

When('I click {string} on the limit for {string}', (action: string, personName: string) => {
  cy.contains('tr', personName).contains(action).click();
});

When('I click {string} on the first limit for {string}', (action: string, personName: string) => {
  cy.contains('tr', personName).first().contains(action).click();
});

When('I search for {string} in person name field', (searchText: string) => {
  cy.get('.ant-select').first().click();
  cy.get('.ant-select-selection-search-input').first().clear({ force: true }).type(searchText, { force: true });
});

When('I select {string} from search results', (optionText: string) => {
  // optionText format: "John Doe (john.doe)" - extract displayName
  const match = optionText.match(/^(.+?)\s*\(([^)]+)\)$/);
  const displayName = match ? match[1] : optionText;

  cy.get('.ant-select-dropdown').should('be.visible');
  cy.contains('.ant-select-item-option', displayName).click();
});

When(/^I set the limit to (\d+)$/, (value: string) => {
  cy.get('.ant-input-number-input').clear().type(value).blur();
});

When('I select only columns {string}', (columnNames: string) => {
  const names = columnNames.split(',').map(s => s.trim());
  columns.forEach(col => {
    const checkbox = cy.contains('label', col.name).find('input[type="checkbox"]');
    if (names.includes(col.name)) {
      checkbox.check({ force: true });
    } else {
      checkbox.uncheck({ force: true });
    }
  });
});

When('I select only swimlane {string}', (swimlaneName: string) => {
  // Wait for swimlane list to be visible
  cy.get('[data-testid="swimlane-list"]').should('be.visible');
  swimlanes.forEach(swim => {
    const checkbox = cy.contains('label', swim.name).find('input[type="checkbox"]');
    if (swim.name === swimlaneName) {
      checkbox.check({ force: true });
    } else {
      checkbox.uncheck({ force: true });
    }
  });
});

When('I select issue types {string}', (issueTypesStr: string) => {
  const types = issueTypesStr.split(',').map(s => s.trim());
  cy.get('#project-input-person-limit-form').type('TEST');
  cy.contains('Issue types from project', { timeout: 5000 }).should('be.visible');
  types.forEach(type => {
    cy.get(`input[type="checkbox"][value="${type}"]`).check();
  });
});

// --- Then steps ---

Then('{string} should not be in the limits list', (personName: string) => {
  cy.contains(personName).should('not.exist');
});

Then('I should see {string} in the limits list', (personName: string) => {
  cy.contains('tr', personName).should('be.visible');
});

Then('I should see an empty limits table', () => {
  cy.get('.ant-table-tbody .ant-table-row').should('not.exist');
});

Then(/^I should see (\d+) limits? in the table$/, (count: string) => {
  cy.get('.ant-table-tbody .ant-table-row').should('have.length', parseInt(count, 10));
});

Then(
  /^I should see limit: name "([^"]*)" value (\d+) columns "([^"]*)" swimlanes "([^"]*)" issueTypes "([^"]*)"$/,
  (displayName: string, value: string, columnsStr: string, swimlanesStr: string, issueTypesStr: string) => {
    cy.contains('tr', displayName)
      .scrollIntoView()
      .within(() => {
        cy.contains(value).should('be.visible');

        const colDisplay = columnsStr === 'all' ? 'All columns' : columnsStr;
        const swimDisplay = swimlanesStr === 'all' ? 'All swimlanes' : swimlanesStr;
        const issueDisplay = issueTypesStr === 'all' ? 'All types' : issueTypesStr;

        cy.get('td').eq(2).should('contain.text', colDisplay);
        cy.get('td').eq(3).should('contain.text', swimDisplay);
        cy.get('td').eq(4).should('contain.text', issueDisplay);
      });
  }
);

Then(
  /^the showAllPersonIssues column for "([^"]*)" should show "([^"]*)"$/,
  (displayName: string, expectedValue: string) => {
    cy.contains('tr', displayName)
      .scrollIntoView()
      .within(() => {
        cy.get('td').eq(5).should('contain.text', expectedValue);
      });
  }
);

Then('the form should be reset to default values', () => {
  cy.get('.ant-select-selection-search-input').first().should('have.value', '');
  cy.get('.ant-input-number-input').should('have.value', '1');
  cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
  cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
  cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
});

Then('I should see validation error {string}', (errorMessage: string) => {
  cy.contains(errorMessage).scrollIntoView().should('exist');
});

Then('I should see validation error for duplicate limit', () => {
  cy.contains('A limit with the same filters already exists').scrollIntoView().should('exist');
});

Then('the person name field should have error highlight', () => {
  cy.get('.ant-form-item-has-error').should('exist');
});

Then('the person name field should not have error highlight', () => {
  cy.get('.ant-form-item-has-error').should('not.exist');
});

Then(/^the limit field should show value (\d+)$/, (value: string) => {
  cy.get('.ant-input-number-input').should('have.value', value);
});

Then('the person select should show {string}', (personName: string) => {
  cy.get('.ant-select-selection-item').should('contain.text', personName);
});

Then('the button should show {string}', (buttonText: string) => {
  cy.get('button[type="submit"], button.ant-btn-primary').should('contain.text', buttonText);
});

Then('issue types {string} should be selected', (issueTypesStr: string) => {
  const types = issueTypesStr.split(',').map(s => s.trim());
  cy.contains('Selected issue types:').should('be.visible');
  types.forEach(type => {
    cy.contains('Selected issue types:').parent().contains(type).should('be.visible');
  });
});

// --- Modal lifecycle steps ---

Then('I should see the Personal WIP Limits modal', () => {
  cy.contains('Personal WIP Limit').scrollIntoView().should('be.visible');
  cy.get('[role="dialog"]').scrollIntoView().should('be.visible');
});

Then('I should see the avatar warning message', () => {
  cy.contains('To work correctly').should('be.visible');
});

Then('the person name select should be empty', () => {
  cy.get('#edit-person-wip-limit-person-name')
    .closest('.ant-select')
    .find('.ant-select-selection-item')
    .should('not.exist');
});

// --- Person search steps ---

Then('I should see a dropdown with matching users', () => {
  cy.get('.ant-select-dropdown').should('be.visible');
  cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
});

Then('each search result should show avatar, display name and login', () => {
  cy.get('.ant-select-item-option')
    .first()
    .within(() => {
      cy.get('img').should('exist');
      cy.get('span').should('have.length.at.least', 2);
    });
});

Then('I should not see search results dropdown', () => {
  cy.get('.ant-select-item-option').should('not.exist');
});

Then('I should see search results dropdown', () => {
  cy.get('.ant-select-dropdown').should('be.visible');
  cy.get('.ant-select-item-option', { timeout: 2000 }).should('exist');
});

Then('I should see {string} in the dropdown', (text: string) => {
  cy.get('.ant-select-dropdown').should('be.visible');
  cy.contains(text, { timeout: 2000 }).should('be.visible');
});

// --- Swimlane section visibility ---

Then('I should not see the swimlane section', () => {
  // Neither the section label nor the "All swimlanes" checkbox should be in the modal.
  cy.contains('label', 'All swimlanes').should('not.exist');
  cy.get('[data-testid="swimlane-list"]').should('not.exist');
});

Then('I should see the swimlane section', () => {
  cy.contains('label', 'All swimlanes').should('exist');
});
