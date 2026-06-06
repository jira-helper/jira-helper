import { Given, When, Then } from 'cypress/support/bdd-runner';
import type { DataTableRows } from 'cypress/support/bdd-runner';
import { createMockIssue, addIssueToDOM, columnNameToId, getNextIssueId, type BoardContext } from '../helpers';
import { renderSwimlaneVisuals } from '../../renderSwimlaneVisuals';

let boardContext: BoardContext;

export const setBoardContext = (ctx: BoardContext) => {
  boardContext = ctx;
};

// --- Given steps ---

Given('the board has columns {string}', () => {
  // No-op: columns are pre-configured in helpers.tsx setupBoardDOM()
});

Given('the board has swimlanes:', () => {
  // No-op: swimlanes are pre-configured in helpers.tsx setupBoardDOM()
});

Given(
  /^swimlane "([^"]*)" has limit (\d+) for columns "([^"]*)" with issueTypes "([^"]*)"$/,
  (swimlaneId: string, limitStr: string, columnsStr: string, issueTypesStr: string) => {
    const limit = parseInt(limitStr, 10);

    const settingColumns = columnsStr === 'all' ? [] : columnsStr.split(',').map(s => s.trim());

    const includedIssueTypes = issueTypesStr === 'all' ? undefined : issueTypesStr.split(',').map(s => s.trim());

    boardContext.settings[swimlaneId] = {
      limit,
      columns: settingColumns,
      ...(includedIssueTypes ? { includedIssueTypes } : {}),
    };
  }
);

Given(/^swimlane "([^"]*)" has issues:$/, (swimlaneId: string, table: DataTableRows) => {
  table.forEach(row => {
    const columnName = row.column;
    const issueType = row.issueType || 'Task';
    const columnId = columnNameToId[columnName] || columnName;
    const issueId = getNextIssueId();

    const issue = createMockIssue(issueId, issueType);
    addIssueToDOM(issue, columnId, swimlaneId);
  });
});

// --- Shared render helper ---

function applyModelAndRender() {
  const { model } = boardContext;
  model.settings = { ...boardContext.settings };
  model.columnNames = boardContext.pageObject.getColumns();
  model.isInitialized = true;
  model.render();
}

// --- When steps ---

When('the board stats are calculated', () => {
  applyModelAndRender();
});

When('the board visuals are rendered', () => {
  applyModelAndRender();
  renderSwimlaneVisuals(boardContext.model, boardContext.pageObject);
});

// --- Then steps (stats) ---

Then(/^swimlane "([^"]*)" count should be (\d+)$/, (swimlaneId: string, expectedCount: string) => {
  const stats = boardContext.model.getSwimlaneStats(swimlaneId);
  expect(stats).to.exist;
  expect(stats!.count).to.equal(parseInt(expectedCount, 10));
});

Then(/^swimlane "([^"]*)" should be over limit$/, (swimlaneId: string) => {
  expect(boardContext.model.isOverLimit(swimlaneId)).to.be.true;
});

Then(/^swimlane "([^"]*)" should not be over limit$/, (swimlaneId: string) => {
  expect(boardContext.model.isOverLimit(swimlaneId)).to.be.false;
});

// --- Then steps (visuals via pageObject spies) ---

function getInsertCallForSwimlane(swimlaneId: string) {
  const stub = boardContext.pageObject.insertSwimlaneComponent as Cypress.Agent<sinon.SinonStub>;
  const swimlaneHeader = document.querySelector(`.ghx-swimlane[swimlane-id="${swimlaneId}"] .ghx-swimlane-header`);
  return stub.getCalls().find(call => call.args[0] === swimlaneHeader);
}

Then(/^swimlane "([^"]*)" should have a badge "([^"]*)"$/, (swimlaneId: string, badgeText: string) => {
  const call = getInsertCallForSwimlane(swimlaneId);
  expect(call, `insertSwimlaneComponent should be called for swimlane "${swimlaneId}"`).to.exist;

  const reactElement = call!.args[1];
  const { count, limit } = reactElement.props;
  expect(`${count}/${limit}`).to.equal(badgeText);

  expect(call!.args[2]).to.equal('swimlane-limit-badge');
});

Then(/^swimlane "([^"]*)" should not have a badge$/, (swimlaneId: string) => {
  const call = getInsertCallForSwimlane(swimlaneId);
  expect(call, `insertSwimlaneComponent should NOT be called for swimlane "${swimlaneId}"`).to.not.exist;
});

function getHighlightCallForSwimlane(swimlaneId: string) {
  const stub = boardContext.pageObject.highlightSwimlane as Cypress.Agent<sinon.SinonStub>;
  const swimlaneHeader = document.querySelector(`.ghx-swimlane[swimlane-id="${swimlaneId}"] .ghx-swimlane-header`);
  return stub.getCalls().find(call => call.args[0] === swimlaneHeader);
}

Then(/^swimlane "([^"]*)" should be highlighted red$/, (swimlaneId: string) => {
  const call = getHighlightCallForSwimlane(swimlaneId);
  expect(call, `highlightSwimlane should be called for swimlane "${swimlaneId}"`).to.exist;
  expect(call!.args[1]).to.be.true;
});

Then(/^swimlane "([^"]*)" should not be highlighted red$/, (swimlaneId: string) => {
  const call = getHighlightCallForSwimlane(swimlaneId);
  expect(call, `highlightSwimlane should be called for swimlane "${swimlaneId}"`).to.exist;
  expect(call!.args[1]).to.be.false;
});
