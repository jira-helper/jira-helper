/**
 * Step definitions: Column WIP Limits tab on Jira Helper board panel (SC-JHTAB-*).
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { Given, When, Then } from 'cypress/support/bdd-runner';
import type { DataTableRows } from 'cypress/support/bdd-runner';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { propertyModelToken } from '../../../tokens';
import { COLUMN_LIMITS_TEXTS } from '../../../SettingsPage/texts';
import { ColumnLimitsSettingsTab } from '../../ColumnLimitsSettingsTab';
import { columns, mountBoardTabHarnessOnce, setCanEditBoard, canEditBoard } from '../helpers';

Given('I am on the agile board page', () => {
  /* Board DOM is mocked via boardPagePageObject in helpers.setupBackground */
});

Given('I have permission to edit the board', () => {
  setCanEditBoard(true);
});

Given('I do not have permission to edit the board', () => {
  setCanEditBoard(false);
});

Given('column groups were configured via Board Settings modal:', (table: DataTableRows) => {
  const groups: Record<
    string,
    { columns: string[]; max: number; customHexColor?: string; includedIssueTypes?: string[] }
  > = {};

  table.forEach(row => {
    const columnNames = row.columns.split(',').map(s => s.trim());
    const columnIds = columnNames.map(name => {
      const col = columns.find(c => c.name === name);
      return col?.id || name;
    });
    groups[row.name] = {
      columns: columnIds,
      max: parseInt(row.limit, 10),
    };
  });

  globalContainer.inject(propertyModelToken).model.setData(groups);
});

When('I open the Jira Helper panel', () => {
  if (canEditBoard) {
    registerSettings({
      title: COLUMN_LIMITS_TEXTS.tabTitle.en,
      component: () => React.createElement(ColumnLimitsSettingsTab, { swimlanes: [] }),
    });
  }
  mountBoardTabHarnessOnce();
  cy.get('[data-jh-component="boardSettingsComponent"]').click();
  cy.get('[role="dialog"]').should('be.visible');
});

When(/^I select the "([^"]*)" tab$/, (title: string) => {
  cy.contains('.ant-tabs-tab', title).click();
});

When(/^I drag "([^"]*)" column to create a new group in the tab$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.drag(`[data-column-id="${col.id}"]`, '#jh-tab-column-dropzone');
});

When('I close the Jira Helper panel without saving', () => {
  cy.get('[role="dialog"]')
    .find('.ant-modal-footer')
    .first()
    .within(() => {
      cy.contains('button', 'Cancel').click();
    });
  cy.get('[role="dialog"]').should('not.exist');
});

When('I open the Board Settings column limits modal', () => {
  cy.get('#jh-add-group-btn').should('contain.text', COLUMN_LIMITS_TEXTS.settingsButton.en).click({ force: true });
  cy.contains('.ant-modal-title', COLUMN_LIMITS_TEXTS.modalTitle.en).should('be.visible');
});

Then(/^I should not see the "([^"]*)" tab$/, (title: string) => {
  cy.contains('.ant-tabs-tab', title).should('not.exist');
});

Then(/^I should see group with column "([^"]*)" and limit (\d+)$/, (columnName: string, limitStr: string) => {
  cy.contains('.ant-modal-title', COLUMN_LIMITS_TEXTS.modalTitle.en)
    .parents('.ant-modal')
    .first()
    .within(() => {
      cy.contains(columnName).should('be.visible');
      cy.get('.group-limits-input-jh input').should('have.value', limitStr);
    });
});
