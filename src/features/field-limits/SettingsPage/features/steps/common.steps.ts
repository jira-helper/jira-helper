/**
 * Common step definitions for Field WIP Limit Settings tests.
 */
import { Given, When, Then } from '../../../../../../cypress/support/bdd-runner';
import {
  mountSettingsPage,
  addStoredLimit,
  setFields,
  setColumns,
  setSwimlanes,
  getColumns,
  getSwimlanes,
} from '../helpers';
import type { FieldLimit } from '../../../types';
import { CalcType } from '../../../types';

// --- Mapping helpers ---

const CALC_TYPE_LABEL_TO_ENUM: Record<string, string> = {
  'Cards with exact value': CalcType.EXACT_VALUE,
  'Cards with filled field': CalcType.HAS_FIELD,
  'Cards with any of values': CalcType.MULTIPLE_VALUES,
  'Sum of numeric field': CalcType.SUM_NUMBERS,
};

let columnIdCounter = 0;
let swimlaneIdCounter = 0;

function parseList(value: string): string[] {
  if (value === 'all') return [];
  return value.split(',').map(s => s.trim());
}

function columnNamesToIds(names: string[]): string[] {
  return getColumns()
    .filter(c => names.includes(c.name))
    .map(c => c.id);
}

function swimlaneNamesToIds(names: string[]): string[] {
  return getSwimlanes()
    .filter(s => names.includes(s.name))
    .map(s => s.id);
}

function findFieldIdByName(name: string): string {
  return name.toLowerCase();
}

// --- Given steps ---

Given('there are fields {string} on the board', (fieldsStr: string) => {
  const names = fieldsStr.split(',').map(s => s.trim());
  setFields(names.map(name => ({ fieldId: name.toLowerCase(), name })));
});

Given('there are columns {string} on the board', (columnsStr: string) => {
  const names = columnsStr.split(',').map(s => s.trim());
  columnIdCounter = 0;
  setColumns(names.map(name => ({ id: `col${++columnIdCounter}`, name })));
});

Given('there are swimlanes {string} on the board', (swimlanesStr: string) => {
  const names = swimlanesStr.split(',').map(s => s.trim());
  swimlaneIdCounter = 0;
  setSwimlanes(names.map(name => ({ id: `swim${++swimlaneIdCounter}`, name })));
});

Given('there are no field limits configured', () => {
  // storedSettings already empty from setupBackground
});

Given(
  /^a field limit: field "([^"]*)" calcType "([^"]*)" value "([^"]*)" visualName "([^"]*)" limit (\d+) columns "([^"]*)" swimlanes "([^"]*)"$/,
  (
    fieldName: string,
    calcTypeLabel: string,
    value: string,
    visualName: string,
    limitStr: string,
    columnsStr: string,
    swimlanesStr: string
  ) => {
    const fieldId = findFieldIdByName(fieldName);
    const calcType = CALC_TYPE_LABEL_TO_ENUM[calcTypeLabel] ?? CalcType.EXACT_VALUE;
    const colNames = parseList(columnsStr);
    const swimNames = parseList(swimlanesStr);

    const limit: FieldLimit = {
      calcType: calcType as FieldLimit['calcType'],
      fieldId,
      fieldValue: value,
      visualValue: visualName,
      limit: parseInt(limitStr, 10),
      columns: columnNamesToIds(colNames),
      swimlanes: swimlaneNamesToIds(swimNames),
    };

    addStoredLimit(limit);
  }
);

// --- When steps ---

When('I open the settings modal', () => {
  mountSettingsPage();
  cy.contains('button', 'Edit WIP limits by field').click();
  cy.get('[role="dialog"]').should('exist');
  cy.get('[data-testid="field-limits-form"]', { timeout: 10000 }).should('be.visible');
});

When('I click {string} on the limit for {string}', (action: string, visualName: string) => {
  cy.contains('tr', visualName)
    .scrollIntoView()
    .within(() => {
      if (action === 'Edit') {
        cy.get('button').not('.ant-btn-dangerous').first().click({ force: true });
      } else if (action === 'Delete') {
        cy.get('button.ant-btn-dangerous, button[class*="danger"]').click({ force: true });
      }
    });
});

When('I add tag {string} to field values', (tag: string) => {
  cy.get('[data-testid="field-value-tags"]')
    .closest('.ant-select')
    .find('.ant-select-selection-search input')
    .type(`${tag}{enter}`, { force: true });
});

When('I clear {string} dropdown', (label: string) => {
  cy.contains('label', label).then($label => {
    const forAttr = $label.attr('for');
    if (forAttr) {
      cy.get(`#${forAttr}`).closest('.ant-select').find('.ant-select-clear').click({ force: true });
    }
  });
});

// --- Then steps ---

Then(
  /^I should see limit: field "([^"]*)" calcType "([^"]*)" value "([^"]*)" visualName "([^"]*)" limit (\d+) columns "([^"]*)" swimlanes "([^"]*)"$/,
  (
    fieldName: string,
    _calcType: string,
    _value: string,
    visualName: string,
    limitStr: string,
    columnsStr: string,
    swimlanesStr: string
  ) => {
    const colDisplay = columnsStr === 'all' ? 'All' : columnsStr;
    const swimDisplay = swimlanesStr === 'all' ? 'All' : swimlanesStr;

    cy.contains('tr', visualName)
      .scrollIntoView()
      .within(() => {
        cy.contains('td', fieldName).should('be.visible');
        cy.contains('td', limitStr).should('be.visible');
        cy.contains('td', colDisplay).should('be.visible');
        cy.contains('td', swimDisplay).should('be.visible');
      });
  }
);

Then(
  /^I should not see limit: field "([^"]*)" calcType "([^"]*)" value "([^"]*)" visualName "([^"]*)"$/,
  (_fieldName: string, _calcType: string, _value: string, visualName: string) => {
    cy.contains('tr', visualName).should('not.exist');
  }
);

Then(/^I should see (\d+) limits? in the table$/, (count: string) => {
  cy.get('.ant-table-tbody .ant-table-row').should('have.length', parseInt(count, 10));
});

Then('I should see an empty limits table', () => {
  cy.get('.ant-table-tbody .ant-table-row').should('not.exist');
});

Then(/^the "([^"]*)" button should be disabled$/, (buttonText: string) => {
  cy.contains('button', buttonText).should('be.disabled');
});

Then(/^the "([^"]*)" button should be enabled$/, (buttonText: string) => {
  cy.contains('button', buttonText).should('not.be.disabled');
});
