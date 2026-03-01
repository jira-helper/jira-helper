/**
 * Common step definitions for Column Limits SettingsPage tests.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import { useColumnLimitsPropertyStore } from '../../../property/store';
import { WITHOUT_GROUP_ID } from '../../../types';
import { columns, createButtonStubs, mountButton } from '../helpers';

// Re-export for convenience
export { Given, When, Then };
export type { DataTableRows };

// --- Background steps ---

Given('I am on the Column WIP Limits settings page', () => {
  // Background setup is handled in setupBackground()
});

Given(/^there are columns "([^"]*)" on the board$/, () => {
  // Columns are already set in fixtures
});

// --- Given steps ---

Given('no column groups are configured', () => {
  useColumnLimitsPropertyStore.getState().actions.reset();
  useColumnLimitsSettingsUIStore.getState().actions.reset();
});

Given('there are configured column groups:', (table: DataTableRows) => {
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
    const groupData: {
      columns: string[];
      max: number;
      customHexColor?: string;
      includedIssueTypes?: string[];
    } = {
      columns: columnIds,
      max: parseInt(row.limit, 10),
    };
    if (row.color) {
      groupData.customHexColor = row.color.trim();
    }
    if (row.issueTypes) {
      groupData.includedIssueTypes = row.issueTypes.split(',').map(s => s.trim());
    }
    groups[row.name] = groupData;
  });

  useColumnLimitsPropertyStore.getState().actions.setData(groups);
});

// --- When steps ---

When('I open the settings modal', () => {
  const buttonStubs = createButtonStubs();
  mountButton(buttonStubs);
  cy.contains('Group limits').click();
  cy.get('[role="dialog"]').should('exist');
});

When(/^I drag "([^"]*)" column to create a new group$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.drag(`[data-column-id="${col.id}"]`, '#jh-column-dropzone');
});

When(/^I set limit to (\d+)$/, (limitValue: string) => {
  cy.get('.group-limits-input-jh').first().find('input').click().type(`{selectall}${limitValue}`);
  cy.get('body').click();
  cy.wait(300);
});

When(/^I try to set limit to (-?\d+)$/, (limitValue: string) => {
  cy.get('.group-limits-input-jh').first().find('input').click().type(`{selectall}${limitValue}`);
  cy.get('body').click();
});

When(/^I type "([^"]*)" into limit input$/, (text: string) => {
  cy.get('.group-limits-input-jh').first().find('input').click().type(`{selectall}${text}`);
  cy.get('body').click();
});

Then(/^the limit input should show value (\d+)$/, (expectedValue: string) => {
  cy.get('.group-limits-input-jh').first().find('input').should('have.value', expectedValue);
});

When(/^I drag "([^"]*)" column to the first group$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  const firstGroupDropzone = `.dropzone-jh[data-group-id]:not([data-group-id="${WITHOUT_GROUP_ID}"])`;
  cy.drag(`[data-column-id="${col.id}"]`, firstGroupDropzone);
});

When(/^I drag "([^"]*)" column to group "([^"]*)"$/, (columnName: string, groupId: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.drag(`[data-column-id="${col.id}"]`, `.dropzone-jh[data-group-id="${groupId}"]`);
});

When(/^I drag "([^"]*)" column to "Without Group"$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.drag(`[data-column-id="${col.id}"]`, `.dropzone-jh[data-group-id="${WITHOUT_GROUP_ID}"]`);
});

When(/^I start dragging "([^"]*)" column$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.get(`[data-column-id="${col.id}"]`).first().trigger('dragstart', { dataTransfer: new DataTransfer() });
  cy.get('#jh-column-dropzone').trigger('dragover');
});

When('I click the color picker button', () => {
  cy.get('.group-limits-input-jh').first().closest('.ant-card').find('button').contains('Change color').click();
});

When(/^I select color "([^"]*)"$/, (color: string) => {
  cy.get('input[type="color"]').invoke('val', color).trigger('change');
});

When(/^I select issue types "([^"]*)"$/, (typesStr: string) => {
  const typeNames = typesStr.split(',').map(s => s.trim());
  cy.then(() => {
    const { groups } = useColumnLimitsSettingsUIStore.getState().data;
    const groupId = groups[0]?.id;
    if (!groupId) throw new Error('No group found to set issue types');
    useColumnLimitsSettingsUIStore.getState().actions.setIssueTypeState(groupId, {
      countAllTypes: false,
      projectKey: '',
      selectedTypes: typeNames,
    });
  });
});

When(/^I change group "([^"]*)" limit to (\d+)$/, (groupId: string, limitValue: string) => {
  cy.get(`.dropzone-jh[data-group-id="${groupId}"]`)
    .closest('.ant-card')
    .find('.group-limits-input-jh input')
    .click()
    .type(`{selectall}${limitValue}`);
  cy.get('body').click();
  cy.wait(300);
});

When(/^I click color picker for group "([^"]*)"$/, (groupId: string) => {
  cy.get(`button[data-group-id="${groupId}"]`).contains('Change color').click();
});

When(/^I set issue types "([^"]*)" for group "([^"]*)"$/, (typesStr: string, groupId: string) => {
  const typeNames = typesStr.split(',').map(s => s.trim());
  cy.then(() => {
    useColumnLimitsSettingsUIStore.getState().actions.setIssueTypeState(groupId, {
      countAllTypes: false,
      projectKey: '',
      selectedTypes: typeNames,
    });
  });
});

When(/^I enable "Count all issue types" for group "([^"]*)"$/, (groupId: string) => {
  cy.get(`.dropzone-jh[data-group-id="${groupId}"]`)
    .closest('.ant-card')
    .within(() => {
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').check();
    });
});

// --- Then steps ---

Then('I should see the modal', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Limits for groups').should('be.visible');
});

Then(/^the "Without Group" section should contain all columns$/, () => {
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`)
    .first()
    .within(() => {
      columns.forEach(col => {
        cy.contains(col.name).should('exist');
      });
    });
});

Then(/^the "Without Group" section should contain "([^"]*)" and "([^"]*)"$/, (col1: string, col2: string) => {
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`)
    .first()
    .within(() => {
      cy.contains(col1).should('exist');
      cy.contains(col2).should('exist');
    });
});

Then('I should see instruction to drag columns', () => {
  cy.contains('Drag column over here to create group').should('be.visible');
});

Then(/^the "Without Group" section should be empty$/, () => {
  cy.get(`.dropzone-jh[data-group-id="${WITHOUT_GROUP_ID}"]`).find('[data-column-id]').should('have.length', 0);
});

Then(/^group "([^"]*)" should have columns in order "([^"]*)"$/, (groupId: string, columnNames: string) => {
  const names = columnNames.split(',').map(s => s.trim());
  cy.get(`.dropzone-jh[data-group-id="${groupId}"]`)
    .find('[data-column-id]')
    .should('have.length', names.length)
    .each(($el, index) => {
      cy.wrap($el).should('contain.text', names[index]);
    });
});

Then(/^the "Without Group" section should not contain "([^"]*)"$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`).first().find(`[data-column-id="${col.id}"]`).should('not.exist');
});

Then(/^the "Without Group" section should contain "([^"]*)"$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.get(`[data-group-id="${WITHOUT_GROUP_ID}"]`).first().find(`[data-column-id="${col.id}"]`).should('exist');
});

Then(/^group "([^"]*)" should contain columns "([^"]*)"$/, (groupId: string, columnNames: string) => {
  const names = columnNames.split(',').map(s => s.trim());
  cy.get(`.dropzone-jh[data-group-id="${groupId}"]`).within(() => {
    names.forEach(name => {
      const col = columns.find(c => c.name === name);
      if (col) cy.get(`[data-column-id="${col.id}"]`).should('exist');
      else cy.contains(name).should('exist');
    });
  });
});

Then(/^I should not see group "([^"]*)"$/, (groupId: string) => {
  cy.get(`.dropzone-jh[data-group-id="${groupId}"]`).should('not.exist');
});

Then(/^group "([^"]*)" should contain only "([^"]*)"$/, (groupId: string, columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.get(`.dropzone-jh[data-group-id="${groupId}"]`).within(() => {
    cy.get('[data-column-id]').should('have.length', 1);
    cy.get(`[data-column-id="${col.id}"]`).should('exist');
  });
});

Then('the dropzone should be highlighted', () => {
  cy.get('#jh-column-dropzone')
    .invoke('attr', 'class')
    .should('match', /ActiveJH/);
});

Then(/^I should see a drag preview for "([^"]*)"$/, (columnName: string) => {
  const col = columns.find(c => c.name === columnName);
  if (!col) throw new Error(`Column "${columnName}" not found`);
  cy.get(`[data-column-id="${col.id}"]`).should('exist').and('have.attr', 'draggable', 'true');
});

Then('there should be no configured groups', () => {
  cy.get('.group-limits-input-jh').should('have.length', 0);
});

Then(/^I should see a new group with column "([^"]*)"$/, (columnName: string) => {
  cy.get('.group-limits-input-jh')
    .first()
    .closest('.ant-card')
    .within(() => {
      cy.contains(columnName).should('exist');
    });
});

Then(/^I should see a group with columns "([^"]*)"$/, (columnNames: string) => {
  const names = columnNames.split(',').map(s => s.trim());
  cy.get('.group-limits-input-jh')
    .first()
    .closest('.ant-card')
    .within(() => {
      names.forEach(name => {
        cy.contains(name).should('exist');
      });
    });
});

Then(/^the group should have limit (\d+)$/, (limitValue: string) => {
  cy.get('.group-limits-input-jh').first().find('input').should('have.value', limitValue);
});

Then(/^the group should have color "([^"]*)"$/, (expectedColor: string) => {
  const hex = expectedColor.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const expectedRgb = `rgb(${r}, ${g}, ${b})`;

  cy.get('.group-limits-input-jh')
    .first()
    .closest('.ant-card')
    .find('button')
    .contains('Change color')
    .find('span')
    .first()
    .should('have.css', 'background-color', expectedRgb);
});

Then(/^the group should filter by "([^"]*)"$/, (expectedTypes: string) => {
  const typeNames = expectedTypes.split(',').map(s => s.trim());
  cy.then(() => {
    const { groups } = useColumnLimitsSettingsUIStore.getState().data;
    const groupId = groups[0]?.id;
    if (!groupId) throw new Error('No group found');
    const state = useColumnLimitsSettingsUIStore.getState().data.issueTypeSelectorStates[groupId];

    expect(state?.countAllTypes).to.be.false;
    expect(state?.selectedTypes).to.deep.equal(typeNames);
  });
});

Then(
  /^I should see group "([^"]*)" with columns "([^"]*)" and limit (\d+)$/,
  (_groupName: string, columnNames: string, limit: string) => {
    const names = columnNames.split(',').map(s => s.trim());

    cy.get('.group-limits-input-jh')
      .first()
      .closest('.ant-card')
      .within(() => {
        names.forEach(name => {
          cy.contains(name).should('exist');
        });
        cy.get('input').should('have.value', limit);
      });
  }
);

Then('no changes should be saved', () => {
  cy.get('@updateBoardProperty').should('not.have.been.called');
});

Then('changes should be saved', () => {
  cy.get('@updateBoardProperty').should('have.been.called');
});

Then(/^group "([^"]*)" should have limit (\d+) in property$/, (groupId: string, limitStr: string) => {
  const limit = parseInt(limitStr, 10);
  cy.get('@updateBoardProperty').should('have.been.called');
  cy.then(() => {
    const { data } = useColumnLimitsPropertyStore.getState();

    expect(data[groupId]).to.exist;
    expect(data[groupId]?.max).to.equal(limit);
  });
});

Then(/^group "([^"]*)" should have color "([^"]*)" in property$/, (groupId: string, expectedColor: string) => {
  cy.get('@updateBoardProperty').should('have.been.called');
  cy.then(() => {
    const { data } = useColumnLimitsPropertyStore.getState();

    expect(data[groupId]).to.exist;
    expect((data[groupId]?.customHexColor ?? '').toLowerCase()).to.equal(expectedColor.toLowerCase());
  });
});

Then(/^group "([^"]*)" should filter by "([^"]*)" in property$/, (groupId: string, expectedTypes: string) => {
  const typeNames = expectedTypes.split(',').map(s => s.trim());
  cy.get('@updateBoardProperty').should('have.been.called');
  cy.then(() => {
    const { data } = useColumnLimitsPropertyStore.getState();

    expect(data[groupId]).to.exist;
    expect(data[groupId]?.includedIssueTypes).to.deep.equal(typeNames);
  });
});

Then(/^group "([^"]*)" should count all issue types in property$/, (groupId: string) => {
  cy.get('@updateBoardProperty').should('have.been.called');
  cy.then(() => {
    const { data } = useColumnLimitsPropertyStore.getState();

    expect(data[groupId]).to.exist;
    const included = data[groupId]?.includedIssueTypes;

    expect(!included || included.length === 0).to.be.true;
  });
});
