/**
 * Common step definitions for WIP Limit on Cells BoardPage tests.
 *
 * NOTE: Global steps from cypress/support/gherkin-steps/common.ts are auto-imported.
 * Do NOT redefine steps like "I see text", "I click button", etc.
 */
import { Given, When, Then } from '../../../../../cypress/support/bdd-runner';
import type { DataTableRows } from '../../../../../cypress/support/bdd-runner';
import { renderWipLimitCells } from '../../actions/renderWipLimitCells';
import {
  createRange,
  shouldCountIssue,
  createMockIssue,
  addIssuesToCell,
  cellHasBadge,
  cellHasBorder,
  swimlaneNameToId,
  columnNameToId,
  resetIssueCounter,
  getNextIssueId,
} from '../helpers';
import type { BoardContext } from '../helpers';
import type { WipLimitRange, WipLimitCell } from '../../../types';

// Re-export for convenience
export { Given, When, Then };
export type { DataTableRows };

// --- State for building ranges across Given steps ---

let boardContext: BoardContext;
const pendingRanges: Map<
  string,
  {
    wipLimit: number;
    disable: boolean;
    includedIssueTypes: string[];
    cells: WipLimitCell[];
  }
> = new Map();

export const setBoardContext = (ctx: BoardContext) => {
  boardContext = ctx;
  pendingRanges.clear();
  resetIssueCounter();
};

export const getRanges = (): WipLimitRange[] => {
  return Array.from(pendingRanges.entries()).map(([name, config]) =>
    createRange(name, config.wipLimit, config.cells, {
      disable: config.disable,
      includedIssueTypes: config.includedIssueTypes.length > 0 ? config.includedIssueTypes : undefined,
    })
  );
};

// --- Background steps ---

Given('the board is loaded', () => {
  // Setup done in beforeEach via setupBackground()
});

Given('there are columns:', () => {
  // Columns pre-configured in helpers.tsx
});

Given('there are swimlanes:', () => {
  // Swimlanes pre-configured in helpers.tsx
});

// --- Range Setup (DataTable format) ---

/**
 * Given there is a range "Critical Path" with:
 *   | wipLimit | disable |
 *   | 5        | false   |
 */
Given(/^there is a range "([^"]*)" with:$/, (rangeName: string, table: DataTableRows) => {
  const row = table[0] || {};
  pendingRanges.set(rangeName, {
    wipLimit: parseInt(row.wipLimit || '0', 10),
    disable: row.disable === 'true',
    includedIssueTypes: row.includedIssueTypes ? row.includedIssueTypes.split(',').map((s: string) => s.trim()) : [],
    cells: [],
  });
});

/**
 * Given the range "Critical Path" has cells:
 *   | swimlane | column      | showBadge |
 *   | Frontend | In Progress | true      |
 */
Given(/^the range "([^"]*)" has cells:$/, (rangeName: string, table: DataTableRows) => {
  const pending = pendingRanges.get(rangeName);
  if (!pending) throw new Error(`Range "${rangeName}" not defined`);

  table.forEach(row => {
    const swimlaneId = swimlaneNameToId[row.swimlane] || row.swimlane;
    const columnId = columnNameToId[row.column] || row.column;
    pending.cells.push({
      swimlane: swimlaneId,
      column: columnId,
      showBadge: row.showBadge === 'true',
    });
  });
});

// --- Issues Setup ---

/**
 * Given there are 3 issues in cell "Frontend / In Progress"
 */
Given(/^there are (\d+) issues in cell "([^"]*)"$/, (count: string, cellName: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
  if (cell) {
    addIssuesToCell(cell, parseInt(count, 10));
  }
});

/**
 * Given cell "Frontend / In Progress" contains issues:
 *   | type  |
 *   | Bug   |
 *   | Task  |
 */
Given(/^cell "([^"]*)" contains issues:$/, (cellName: string, table: DataTableRows) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
  if (cell) {
    table.forEach(row => {
      const issueId = getNextIssueId();
      const issue = createMockIssue(issueId, row.type || 'Task');
      cell.appendChild(issue);
    });
  }
});

// --- Board Display ---

When('the board is displayed', () => {
  const ranges = getRanges();
  cy.then(() => {
    renderWipLimitCells(ranges, shouldCountIssue);
  });
});

// --- Dynamic Update steps ---

When(/^an issue is added to cell "([^"]*)"$/, (cellName: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    if (cell) {
      const issueId = getNextIssueId();
      const issue = createMockIssue(issueId, 'Task');
      cell.appendChild(issue);
    }
  });
});

When(/^an issue is removed from cell "([^"]*)"$/, (cellName: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    if (cell) {
      const issue = cell.querySelector('.ghx-issue');
      if (issue) issue.remove();
    }
  });
});

When('the board is re-rendered', () => {
  const ranges = getRanges();
  cy.then(() => {
    document.querySelectorAll('.WipLimitCellsBadge').forEach(el => el.remove());
    renderWipLimitCells(ranges, shouldCountIssue);
  });
});

// --- Badge Assertions ---

Then(/^the cell "([^"]*)" should show a badge "([^"]*)"$/, (cellName: string, badgeText: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    expect(cell).to.exist;
    expect(cellHasBadge(cell!, badgeText)).to.be.true;
  });
});

Then(/^the cell "([^"]*)" should not show a badge$/, (cellName: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    expect(cell).to.exist;
    const badge = cell!.querySelector('.WipLimitCellsBadge');
    expect(badge).to.be.null;
  });
});

// --- Color Assertions ---

Then(
  /^the badge in cell "([^"]*)" should have (?:green |yellow |red )?background color "([^"]*)"$/,
  (cellName: string, expectedColor: string) => {
    const [swName, colName] = cellName.split(' / ').map(s => s.trim());
    const swimlaneId = swimlaneNameToId[swName] || swName;
    const columnId = columnNameToId[colName] || colName;

    cy.then(() => {
      const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
      expect(cell).to.exist;
      const badge = cell!.querySelector('.WipLimitCellsBadge');
      expect(badge).to.exist;
      const style = badge!.getAttribute('style') || '';
      expect(style).to.include(expectedColor);
    });
  }
);

// --- Cell Background Assertions ---

Then(/^the cell "([^"]*)" should have class "([^"]*)"$/, (cellName: string, className: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    expect(cell).to.exist;
    expect(cell!.classList.contains(className)).to.be.true;
  });
});

Then(/^the cell "([^"]*)" should not have class "([^"]*)"$/, (cellName: string, className: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    expect(cell).to.exist;
    expect(cell!.classList.contains(className)).to.be.false;
  });
});

// --- Border Assertions ---

Then(/^the cell "([^"]*)" should have dashed border on (top|bottom|left|right)$/, (cellName: string, side: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    expect(cell).to.exist;
    expect(cellHasBorder(cell!, side as 'top' | 'bottom' | 'left' | 'right')).to.be.true;
  });
});

Then(
  /^the cell "([^"]*)" should not have dashed border on (top|bottom|left|right)$/,
  (cellName: string, side: string) => {
    const [swName, colName] = cellName.split(' / ').map(s => s.trim());
    const swimlaneId = swimlaneNameToId[swName] || swName;
    const columnId = columnNameToId[colName] || colName;

    cy.then(() => {
      const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
      expect(cell).to.exist;
      expect(cellHasBorder(cell!, side as 'top' | 'bottom' | 'left' | 'right')).to.be.false;
    });
  }
);

// --- No WIP limits ---

Given('there are no WIP limit on cells settings configured', () => {
  pendingRanges.clear();
});

Then('no WIP limit badges should be shown', () => {
  cy.get('.WipLimitCellsBadge').should('not.exist');
});

Then('no dashed borders should be applied', () => {
  cy.get('[class*="WipLimitCellsRange_"]').should('not.exist');
});

Then('the board should display normally', () => {
  cy.get('.ghx-board').should('exist');
});
