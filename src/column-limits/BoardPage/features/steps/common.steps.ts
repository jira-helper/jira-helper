/**
 * Common step definitions for Column Limits BoardPage tests.
 *
 * Step definitions are added in subsequent tasks as features are implemented.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { useColumnLimitsPropertyStore } from '../../../property';
import { applyLimits } from '../../actions';
import {
  createMockIssue,
  addIssueToDOM,
  columnNameToId,
  swimlaneNameToId,
  resetIssueCounter,
  getNextIssueId,
} from '../helpers';

// --- Utility functions ---

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

// --- Given steps ---

/**
 * Given the board has columns:
 * | name        |
 * | In Progress |
 *
 * Documents available columns (actual DOM setup done in setupBackground).
 */
Given('the board has columns:', () => {
  // No-op: columns are pre-configured in helpers.tsx setupBoardDOM()
});

/**
 * Given the board has swimlanes:
 * | name     |
 * | Frontend |
 *
 * Documents available swimlanes (actual DOM setup done in setupBackground).
 */
Given('the board has swimlanes:', () => {
  // No-op: swimlanes are pre-configured in helpers.tsx setupBoardDOM()
});

/**
 * Given there are column groups:
 * | name        | columns             | limit | color   | issueTypes | swimlanes         |
 * | Development | In Progress, Review | 5     | #36B37E |            | Frontend, Backend |
 */
Given('there are column groups:', (table: DataTableRows) => {
  resetIssueCounter();
  const data: Record<
    string,
    {
      columns: string[];
      max: number;
      customHexColor?: string;
      includedIssueTypes?: string[];
      swimlanes?: Array<{ id: string; name: string }>;
    }
  > = {};

  table.forEach(row => {
    const { name } = row;
    const columnNames = row.columns.split(',').map((s: string) => s.trim());
    const columnIds = columnNames.map((n: string) => columnNameToId[n] || n);
    const limit = parseInt(row.limit, 10);
    const color = row.color?.trim() || undefined;
    const issueTypesRaw = row.issueTypes?.trim() || '';
    const issueTypes = issueTypesRaw ? issueTypesRaw.split(',').map((s: string) => s.trim()) : undefined;
    const swimlanesRaw = row.swimlanes?.trim() || '';
    const swimlaneNames = swimlanesRaw ? swimlanesRaw.split(',').map((s: string) => s.trim()) : [];
    const swimlaneObjs = swimlaneNames.map(swName => ({
      id: swimlaneNameToId[swName] || swName,
      name: swName,
    }));

    data[name] = {
      columns: columnIds,
      max: limit,
      ...(color && { customHexColor: color }),
      ...(issueTypes && { includedIssueTypes: issueTypes }),
      ...(swimlaneObjs.length > 0 && { swimlanes: swimlaneObjs }),
    };
  });

  useColumnLimitsPropertyStore.getState().actions.setData(data);
});

/**
 * Given the board has issues:
 * | column      | swimlane | issueType |
 * | In Progress | Frontend | Task      |
 */
Given('the board has issues:', (table: DataTableRows) => {
  table.forEach(row => {
    const columnName = row.column;
    const swimlaneName = row.swimlane;
    const issueType = row.issueType || 'Task';

    const columnId = columnNameToId[columnName] || columnName;
    const swimlaneId = swimlaneNameToId[swimlaneName] || swimlaneName;
    const issueId = getNextIssueId();

    const issue = createMockIssue(issueId, columnId, swimlaneId, issueType);
    addIssueToDOM(issue, columnId, swimlaneId);
  });
});

// --- When steps ---

/**
 * When the board is displayed
 */
When('the board is displayed', () => {
  applyLimits();
});

/**
 * When a new issue appears in "In Progress"
 * Adds one issue to the column and re-applies limits.
 * Used for SC-DISPLAY-2: badge update when issue count changes.
 */
When('a new issue appears in {string}', (columnName: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  const swimlaneId = 'sw2'; // Use Backend swimlane for the new issue
  const issueId = getNextIssueId();
  const issue = createMockIssue(issueId, columnId, swimlaneId, 'Task');
  addIssueToDOM(issue, columnId, swimlaneId);
  applyLimits();
});

// --- Then steps ---

/**
 * Then the badge on "In Progress" should show "4/5"
 */
Then('the badge on {string} should show {string}', (columnName: string, badgeText: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  cy.get(`.ghx-column[data-id="${columnId}"] [data-column-limits-badge="true"]`).should('contain', badgeText);
});

/**
 * Then the badge should show "3/3"
 * Used when there is a single group and badge location is implicit.
 */
Then('the badge should show {string}', (badgeText: string) => {
  cy.get('[data-column-limits-badge="true"]').should('contain', badgeText);
});

/**
 * Then {string} column cells should have red background
 */
Then('{string} column cells should have red background', (columnName: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  cy.get(`.ghx-swimlane .ghx-column[data-column-id="${columnId}"]`)
    .first()
    .should('have.css', 'background-color', 'rgb(255, 86, 48)');
});

/**
 * Then {string} column cells should have normal background
 */
Then('{string} column cells should have normal background', (columnName: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  cy.get(`.ghx-swimlane .ghx-column[data-column-id="${columnId}"]`)
    .first()
    .should('not.have.css', 'background-color', 'rgb(255, 86, 48)');
});

/**
 * Then the limit should be exceeded
 */
Then('the limit should be exceeded', () => {
  cy.get('.ghx-swimlane .ghx-column').first().should('have.css', 'background-color', 'rgb(255, 86, 48)');
});

/**
 * Then the limit should not be exceeded
 */
Then('the limit should not be exceeded', () => {
  cy.get('.ghx-swimlane .ghx-column').first().should('not.have.css', 'background-color', 'rgb(255, 86, 48)');
});

/**
 * Then {string} and {string} headers should have border color {string}
 */
Then('{string} and {string} headers should have border color {string}', (col1: string, col2: string, color: string) => {
  const colId1 = columnNameToId[col1] || col1;
  const colId2 = columnNameToId[col2] || col2;
  const rgbColor = hexToRgb(color);

  cy.get(`.ghx-column[data-id="${colId1}"]`).should('have.css', 'border-top-color', rgbColor);
  cy.get(`.ghx-column[data-id="${colId2}"]`).should('have.css', 'border-top-color', rgbColor);
});

/**
 * Then {string} should have a badge
 */
Then('{string} should have a badge', (columnName: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  cy.get(`.ghx-column[data-id="${columnId}"]`).should('contain', '/');
});

/**
 * Then {string} columns should have {string} border
 * Accepts hex color (e.g., "#36B37E") and converts to RGB for comparison.
 */
Then('{string} columns should have {string} border', (groupName: string, hexColor: string) => {
  const expectedColor = hexToRgb(hexColor);

  const groupData = useColumnLimitsPropertyStore.getState().data[groupName];
  if (groupData?.columns) {
    groupData.columns.forEach(colId => {
      cy.get(`.ghx-column[data-id="${colId}"]`).should('have.css', 'border-top-color', expectedColor);
    });
  }
});

/**
 * Then {string} cells should have red background
 */
Then('{string} cells should have red background', (columnName: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  cy.get(`.ghx-swimlane .ghx-column[data-column-id="${columnId}"]`)
    .first()
    .should('have.css', 'background-color', 'rgb(255, 86, 48)');
});

/**
 * Then {string} cells should have normal background
 */
Then('{string} cells should have normal background', (columnName: string) => {
  const columnId = columnNameToId[columnName] || columnName;
  cy.get(`.ghx-swimlane .ghx-column[data-column-id="${columnId}"]`)
    .first()
    .should('not.have.css', 'background-color', 'rgb(255, 86, 48)');
});
