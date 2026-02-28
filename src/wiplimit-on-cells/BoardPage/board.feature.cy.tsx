/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */
/**
 * Cypress Component Tests for WIP Limit on Cells Board Page
 *
 * Tests match 1:1 with board.feature scenarios.
 * Each Scenario/Step text MUST match the .feature file exactly.
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { renderWipLimitCells } from './actions/renderWipLimitCells';
import type { IWipLimitCellsBoardPageObject } from './pageObject';
import { wipLimitCellsBoardPageObjectToken } from './pageObject';
import { useWipLimitCellsRuntimeStore, getInitialState } from './stores';
import type { WipLimitRange } from '../../types';
import { Scenario, Step } from '../../../cypress/support/bdd';
import 'cypress/support/gherkin-steps/common';

// --- Test fixtures matching feature Background ---

const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
  { id: 'sw3', name: 'QA' },
];

/**
 * Creates a mock swimlane DOM element.
 */
const createMockSwimlane = (id: string, name: string): HTMLElement => {
  const swimlane = document.createElement('div');
  swimlane.className = 'ghx-swimlane';
  swimlane.setAttribute('swimlane-id', id);
  swimlane.setAttribute('data-swimlane-name', name);
  return swimlane;
};

/**
 * Creates a mock column DOM element.
 */
const createMockColumn = (id: string, name: string): HTMLElement => {
  const column = document.createElement('div');
  column.className = 'ghx-column';
  column.setAttribute('data-column-id', id);
  column.setAttribute('data-column-name', name);
  return column;
};

/**
 * Creates a mock issue DOM element.
 */
const createMockIssue = (id: string, issueType: string = 'Task'): HTMLElement => {
  const issue = document.createElement('div');
  issue.className = 'ghx-issue';
  issue.setAttribute('data-issue-id', id);
  issue.setAttribute('data-issue-type', issueType);
  issue.textContent = `Issue ${id}`;
  return issue;
};

/**
 * Creates a mock board DOM structure with swimlanes and columns.
 */
const createMockBoard = (): {
  container: HTMLElement;
  cells: Map<string, HTMLElement>; // key: "swimlaneId/columnId"
} => {
  const container = document.createElement('div');
  container.className = 'ghx-board';
  const cells = new Map<string, HTMLElement>();

  for (const swimlane of swimlanes) {
    const swimlaneEl = createMockSwimlane(swimlane.id, swimlane.name);
    container.appendChild(swimlaneEl);

    for (const column of columns) {
      const columnEl = createMockColumn(column.id, column.name);
      swimlaneEl.appendChild(columnEl);
      cells.set(`${swimlane.id}/${column.id}`, columnEl);
    }
  }

  return { container, cells };
};

/**
 * Creates a mock PageObject for testing.
 */
const createMockPageObject = (cells: Map<string, HTMLElement>): IWipLimitCellsBoardPageObject => {
  const allCellsArray: Element[][] = [];
  for (const swimlane of swimlanes) {
    const row: Element[] = [];
    for (const column of columns) {
      const cell = cells.get(`${swimlane.id}/${column.id}`);
      if (cell) row.push(cell);
    }
    allCellsArray.push(row);
  }

  return {
    selectors: {
      swimlane: '.ghx-swimlane',
      column: '.ghx-column',
    },
    getAllCells: () => allCellsArray,
    getCellElement: (swimlaneId: string, columnId: string) => {
      return cells.get(`${swimlaneId}/${columnId}`) || null;
    },
    getIssuesInCell: (cell: Element, cssSelector: string) => {
      return Array.from(cell.querySelectorAll(cssSelector));
    },
    addCellClass: (cell: Element, className: string) => {
      cell.classList.add(className);
    },
    removeCellClass: (cell: Element, className: string) => {
      cell.classList.remove(className);
    },
    setCellBackgroundColor: (cell: Element, color: string) => {
      (cell as HTMLElement).style.backgroundColor = color;
    },
    insertBadge: (cell: Element, html: string) => {
      (cell as HTMLElement).insertAdjacentHTML('afterbegin', html);
    },
  };
};

/**
 * Helper to add issues to a cell.
 */
const addIssuesToCell = (cell: HTMLElement, issueIds: string[], issueTypes: string[] = []): void => {
  issueIds.forEach((id, index) => {
    const issueType = issueTypes[index] || 'Task';
    const issue = createMockIssue(id, issueType);
    cell.appendChild(issue);
  });
};

/**
 * Helper to check if cell has a badge with specific text.
 */
const cellHasBadge = (cell: HTMLElement, expectedText: string): boolean => {
  const badge = cell.querySelector('.WipLimitCellsBadge');
  return badge?.textContent?.trim() === expectedText;
};

/**
 * Helper to get badge background color from style attribute.
 */
const getBadgeBackgroundColor = (cell: HTMLElement): string | null => {
  const badge = cell.querySelector('.WipLimitCellsBadge');
  if (!badge) return null;
  const style = badge.getAttribute('style');
  if (!style) return null;
  const match = style.match(/background-color:\s*([^;]+)/);
  return match ? match[1].trim() : null;
};

/**
 * Helper to check if cell has dashed border class on specific side.
 */
const cellHasBorder = (cell: HTMLElement, side: 'top' | 'bottom' | 'left' | 'right'): boolean => {
  const className = `WipLimitCellsRange_${side}`;
  return cell.classList.contains(className);
};

/**
 * Helper function to filter issues by type.
 */
const shouldCountIssue = (issue: Element, includedIssueTypes?: string[]): boolean => {
  if (!includedIssueTypes || includedIssueTypes.length === 0) {
    return true;
  }
  const issueType = issue.getAttribute('data-issue-type') || '';
  return includedIssueTypes.includes(issueType);
};

// --- Feature ---

describe('Feature: WIP Limit on Cells Board Display', () => {
  let container: HTMLElement;
  let cells: Map<string, HTMLElement>;
  let pageObject: IWipLimitCellsBoardPageObject;

  // Background
  beforeEach(() => {
    // Reset DI container
    globalContainer.reset();
    registerLogger(globalContainer);

    // Reset runtime store
    useWipLimitCellsRuntimeStore.getState().actions.reset();

    // Given the board is loaded
    const board = createMockBoard();
    container = board.container;
    cells = board.cells;
    pageObject = createMockPageObject(cells);

    // Register PageObject in DI
    globalContainer.register({
      token: wipLimitCellsBoardPageObjectToken,
      value: pageObject,
    });

    // Set CSS selector in runtime store
    useWipLimitCellsRuntimeStore.getState().actions.setCssSelectorOfIssues('.ghx-issue');

    // Mount container to DOM for Cypress
    cy.then(() => {
      const root = document.querySelector('[data-cy-root]') || document.body;
      root.appendChild(container);
    });

    // And there are columns: col1, col2, col3, col4
    // And there are swimlanes: sw1, sw2, sw3
    // (Already created in createMockBoard)
  });

  afterEach(() => {
    cy.then(() => {
      container.remove();
    });
  });

  // === BADGE DISPLAY ===

  Scenario('SC-BADGE-1: Show badge with issue count and limit on cell with showBadge enabled', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Critical Path" with WIP limit 5', () => {
      range = {
        name: 'Critical Path',
        wipLimit: 5,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: true },
          { swimlane: 'sw2', column: 'col2', showBadge: false },
        ],
      };
    });

    Step('And the range has cells:', () => {
      // Cells are defined in range
    });

    Step('And there are 3 issues in cell "sw1 / col2"', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3']);
      }
    });

    Step('And there are 1 issues in cell "sw2 / col2"', () => {
      const cell = cells.get('sw2/col2');
      if (cell) {
        addIssuesToCell(cell, ['4']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the cell "sw1 / col2" should show a badge "4/5"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '4/5')).to.be.true;
      });
    });

    Step('And the cell "sw2 / col2" should not show a badge', () => {
      cy.then(() => {
        const cell = cells.get('sw2/col2');
        expect(cell).to.exist;
        const badge = cell!.querySelector('.WipLimitCellsBadge');
        expect(badge).to.be.null;
      });
    });
  });

  Scenario('SC-BADGE-2: Badge counts issues across all cells in range', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Sprint Work" with WIP limit 10', () => {
      range = {
        name: 'Sprint Work',
        wipLimit: 10,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: true },
          { swimlane: 'sw2', column: 'col2', showBadge: true },
          { swimlane: 'sw1', column: 'col3', showBadge: false },
        ],
      };
    });

    Step('And the range has cells:', () => {
      // Cells are defined in range
    });

    Step('And there are 3 issues in cell "sw1 / col2"', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3']);
      }
    });

    Step('And there are 4 issues in cell "sw2 / col2"', () => {
      const cell = cells.get('sw2/col2');
      if (cell) {
        addIssuesToCell(cell, ['4', '5', '6', '7']);
      }
    });

    Step('And there are 2 issues in cell "sw1 / col3"', () => {
      const cell = cells.get('sw1/col3');
      if (cell) {
        addIssuesToCell(cell, ['8', '9']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then badges should show "9/10"', () => {
      cy.then(() => {
        // Check both cells with showBadge=true
        const cell1 = cells.get('sw1/col2');
        const cell2 = cells.get('sw2/col2');
        expect(cell1).to.exist;
        expect(cell2).to.exist;
        expect(cellHasBadge(cell1!, '9/10')).to.be.true;
        expect(cellHasBadge(cell2!, '9/10')).to.be.true;
      });
    });
  });

  // === COLOR INDICATORS ===

  Scenario('SC-COLOR-1: Green badge when within limit', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 5', () => {
      range = {
        name: 'My Range',
        wipLimit: 5,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And the range has a cell "sw1 / col2" with showBadge enabled', () => {
      // Cell is defined in range
    });

    Step('And there are 3 issues in the range cells', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the badge should have green background color "#1b855c"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#1b855c');
      });
    });
  });

  Scenario('SC-COLOR-2: Yellow badge when at limit', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 5', () => {
      range = {
        name: 'My Range',
        wipLimit: 5,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And the range has a cell "sw1 / col2" with showBadge enabled', () => {
      // Cell is defined in range
    });

    Step('And there are 5 issues in the range cells', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3', '4', '5']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the badge should have yellow background color "#ffd700"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#ffd700');
      });
    });
  });

  Scenario('SC-COLOR-3: Red badge when exceeding limit', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 5', () => {
      range = {
        name: 'My Range',
        wipLimit: 5,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And the range has a cell "sw1 / col2" with showBadge enabled', () => {
      // Cell is defined in range
    });

    Step('And there are 7 issues in the range cells', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3', '4', '5', '6', '7']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the badge should have red background color "#ff5630"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#ff5630');
      });
    });
  });

  // === CELL BACKGROUND ===

  Scenario('SC-BG-1: Red background on cells exceeding limit', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 3', () => {
      range = {
        name: 'My Range',
        wipLimit: 3,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: false },
          { swimlane: 'sw2', column: 'col2', showBadge: false },
        ],
      };
    });

    Step('And the range has cells "sw1 / col2" and "sw2 / col2"', () => {
      // Cells are defined in range
    });

    Step('And there are 5 issues total in the range cells', () => {
      const cell1 = cells.get('sw1/col2');
      const cell2 = cells.get('sw2/col2');
      if (cell1) {
        addIssuesToCell(cell1, ['1', '2', '3']);
      }
      if (cell2) {
        addIssuesToCell(cell2, ['4', '5']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then all cells in the range should have red background overlay', () => {
      cy.then(() => {
        const cell1 = cells.get('sw1/col2');
        const cell2 = cells.get('sw2/col2');
        expect(cell1).to.exist;
        expect(cell2).to.exist;
        // #ff563070 is rgba(255, 86, 48, 0.44) - check that it contains red color
        expect(cell1!.style.backgroundColor).to.include('255, 86, 48');
        expect(cell2!.style.backgroundColor).to.include('255, 86, 48');
      });
    });

    Step('And the cells should have class "WipLimit_NotRespected"', () => {
      cy.then(() => {
        const cell1 = cells.get('sw1/col2');
        const cell2 = cells.get('sw2/col2');
        expect(cell1).to.exist;
        expect(cell2).to.exist;
        expect(cell1!.classList.contains('WipLimit_NotRespected')).to.be.true;
        expect(cell2!.classList.contains('WipLimit_NotRespected')).to.be.true;
      });
    });
  });

  Scenario('SC-BG-2: No background change when within limit', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 10', () => {
      range = {
        name: 'My Range',
        wipLimit: 10,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: false },
          { swimlane: 'sw2', column: 'col2', showBadge: false },
        ],
      };
    });

    Step('And the range has cells "sw1 / col2" and "sw2 / col2"', () => {
      // Cells are defined in range
    });

    Step('And there are 5 issues total in the range cells', () => {
      const cell1 = cells.get('sw1/col2');
      const cell2 = cells.get('sw2/col2');
      if (cell1) {
        addIssuesToCell(cell1, ['1', '2', '3']);
      }
      if (cell2) {
        addIssuesToCell(cell2, ['4', '5']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the cells should have class "WipLimit_Respected"', () => {
      cy.then(() => {
        const cell1 = cells.get('sw1/col2');
        const cell2 = cells.get('sw2/col2');
        expect(cell1).to.exist;
        expect(cell2).to.exist;
        expect(cell1!.classList.contains('WipLimit_Respected')).to.be.true;
        expect(cell2!.classList.contains('WipLimit_Respected')).to.be.true;
      });
    });

    Step('And the cells should not have red background overlay', () => {
      cy.then(() => {
        const cell1 = cells.get('sw1/col2');
        const cell2 = cells.get('sw2/col2');
        expect(cell1).to.exist;
        expect(cell2).to.exist;
        // Background color should be empty or not set to red
        const bg1 = cell1!.style.backgroundColor;
        const bg2 = cell2!.style.backgroundColor;
        expect(bg1 === '' || bg1 === 'rgba(0, 0, 0, 0)' || !bg1.includes('255, 86, 48')).to.be.true;
        expect(bg2 === '' || bg2 === 'rgba(0, 0, 0, 0)' || !bg2.includes('255, 86, 48')).to.be.true;
      });
    });
  });

  // === DASHED BORDERS ===

  Scenario('SC-BORDER-1: Single cell gets all four borders', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Solo" with WIP limit 5', () => {
      range = {
        name: 'Solo',
        wipLimit: 5,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: false }],
      };
    });

    Step('And the range has only cell "sw1 / col2"', () => {
      // Cell is defined in range
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then cell "sw1 / col2" should have dashed border on all sides (top, bottom, left, right)', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'top')).to.be.true;
        expect(cellHasBorder(cell!, 'bottom')).to.be.true;
        expect(cellHasBorder(cell!, 'left')).to.be.true;
        expect(cellHasBorder(cell!, 'right')).to.be.true;
      });
    });
  });

  Scenario('SC-BORDER-2: Adjacent cells in same row share inner borders', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Row Range" with WIP limit 10', () => {
      range = {
        name: 'Row Range',
        wipLimit: 10,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: false },
          { swimlane: 'sw1', column: 'col3', showBadge: false },
        ],
      };
    });

    Step('And the range has cells in the same swimlane:', () => {
      // Cells are defined in range
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then cell "sw1 / col2" should have dashed border on top, bottom, and left', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'top')).to.be.true;
        expect(cellHasBorder(cell!, 'bottom')).to.be.true;
        expect(cellHasBorder(cell!, 'left')).to.be.true;
      });
    });

    Step('And cell "sw1 / col2" should not have dashed border on right', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'right')).to.be.false;
      });
    });

    Step('And cell "sw1 / col3" should have dashed border on top, bottom, and right', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col3');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'top')).to.be.true;
        expect(cellHasBorder(cell!, 'bottom')).to.be.true;
        expect(cellHasBorder(cell!, 'right')).to.be.true;
      });
    });

    Step('And cell "sw1 / col3" should not have dashed border on left', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col3');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'left')).to.be.false;
      });
    });
  });

  Scenario('SC-BORDER-3: Adjacent cells in same column share inner borders', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Column Range" with WIP limit 10', () => {
      range = {
        name: 'Column Range',
        wipLimit: 10,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: false },
          { swimlane: 'sw2', column: 'col2', showBadge: false },
        ],
      };
    });

    Step('And the range has cells in the same column:', () => {
      // Cells are defined in range
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then cell "sw1 / col2" should have dashed border on left, right, and top', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'left')).to.be.true;
        expect(cellHasBorder(cell!, 'right')).to.be.true;
        expect(cellHasBorder(cell!, 'top')).to.be.true;
      });
    });

    Step('And cell "sw1 / col2" should not have dashed border on bottom', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'bottom')).to.be.false;
      });
    });

    Step('And cell "sw2 / col2" should have dashed border on left, right, and bottom', () => {
      cy.then(() => {
        const cell = cells.get('sw2/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'left')).to.be.true;
        expect(cellHasBorder(cell!, 'right')).to.be.true;
        expect(cellHasBorder(cell!, 'bottom')).to.be.true;
      });
    });

    Step('And cell "sw2 / col2" should not have dashed border on top', () => {
      cy.then(() => {
        const cell = cells.get('sw2/col2');
        expect(cell).to.exist;
        expect(cellHasBorder(cell!, 'top')).to.be.false;
      });
    });
  });

  Scenario('SC-BORDER-4: L-shaped range has correct borders', () => {
    let range: WipLimitRange;

    Step('Given there is a range "L-Shape" with WIP limit 10', () => {
      range = {
        name: 'L-Shape',
        wipLimit: 10,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: false },
          { swimlane: 'sw2', column: 'col2', showBadge: false },
          { swimlane: 'sw2', column: 'col3', showBadge: false },
        ],
      };
    });

    Step('And the range has cells:', () => {
      // Cells are defined in range
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then each cell should have dashed borders only on edges adjacent to non-range cells', () => {
      cy.then(() => {
        // sw1/col2: top, left, right (no bottom - adjacent to sw2/col2)
        const cell1 = cells.get('sw1/col2');
        expect(cell1).to.exist;
        expect(cellHasBorder(cell1!, 'top')).to.be.true;
        expect(cellHasBorder(cell1!, 'left')).to.be.true;
        expect(cellHasBorder(cell1!, 'right')).to.be.true;
        expect(cellHasBorder(cell1!, 'bottom')).to.be.false;

        // sw2/col2: left, bottom (no top - adjacent to sw1/col2, no right - adjacent to sw2/col3)
        const cell2 = cells.get('sw2/col2');
        expect(cell2).to.exist;
        expect(cellHasBorder(cell2!, 'left')).to.be.true;
        expect(cellHasBorder(cell2!, 'bottom')).to.be.true;
        expect(cellHasBorder(cell2!, 'top')).to.be.false;
        expect(cellHasBorder(cell2!, 'right')).to.be.false;

        // sw2/col3: top, right, bottom (no left - adjacent to sw2/col2)
        const cell3 = cells.get('sw2/col3');
        expect(cell3).to.exist;
        expect(cellHasBorder(cell3!, 'top')).to.be.true;
        expect(cellHasBorder(cell3!, 'right')).to.be.true;
        expect(cellHasBorder(cell3!, 'bottom')).to.be.true;
        expect(cellHasBorder(cell3!, 'left')).to.be.false;
      });
    });
  });

  // === DISABLED RANGE ===

  Scenario('SC-DISABLE-1: Disabled range shows diagonal stripe pattern', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Blocked" with WIP limit 5 and disable flag set to true', () => {
      range = {
        name: 'Blocked',
        wipLimit: 5,
        disable: true,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: false }],
      };
    });

    Step('And the range has cell "sw1 / col2"', () => {
      // Cell is defined in range
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then cell "sw1 / col2" should have the diagonal stripe pattern background', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        // The diagonal stripe pattern is applied via CSS class
        // We check that the class is present
        expect(cell!.classList.contains('WipLimitCells_disable')).to.be.true;
      });
    });

    Step('And cell "sw1 / col2" should have class "WipLimitCells_disable"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cell!.classList.contains('WipLimitCells_disable')).to.be.true;
      });
    });
  });

  Scenario('SC-DISABLE-2: Disabled range still shows borders but no limit indicators', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Blocked" with WIP limit 5 and disable flag set to true', () => {
      range = {
        name: 'Blocked',
        wipLimit: 5,
        disable: true,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: false }],
      };
    });

    Step('And the range has cell "sw1 / col2"', () => {
      // Cell is defined in range
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then cell "sw1 / col2" should have dashed borders', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        // Check that at least one border class is present
        const hasAnyBorder =
          cellHasBorder(cell!, 'top') ||
          cellHasBorder(cell!, 'bottom') ||
          cellHasBorder(cell!, 'left') ||
          cellHasBorder(cell!, 'right');
        expect(hasAnyBorder).to.be.true;
      });
    });

    Step('And the cell should have the diagonal stripe pattern', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cell!.classList.contains('WipLimitCells_disable')).to.be.true;
      });
    });
  });

  // === ISSUE TYPE FILTER ===

  Scenario('SC-FILTER-1: Count only specified issue types', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Bugs Only" with WIP limit 3', () => {
      range = {
        name: 'Bugs Only',
        wipLimit: 3,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
        includedIssueTypes: ['Bug', 'Task'],
      };
    });

    Step('And the range has includedIssueTypes "Bug, Task"', () => {
      // includedIssueTypes is defined in range
    });

    Step('And the range has cell "sw1 / col2" with showBadge enabled', () => {
      // Cell is defined in range
    });

    Step('And cell "sw1 / col2" contains issues:', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3', '4'], ['Bug', 'Task', 'Story', 'Bug']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the badge should show "3/3"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '3/3')).to.be.true;
      });
    });

    Step('And the "Story" issue should not be counted', () => {
      cy.then(() => {
        // Verified by badge showing 3/3 instead of 4/3
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '3/3')).to.be.true;
      });
    });
  });

  Scenario('SC-FILTER-2: Count all issues when no type filter is set', () => {
    let range: WipLimitRange;

    Step('Given there is a range "All Types" with WIP limit 10', () => {
      range = {
        name: 'All Types',
        wipLimit: 10,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And the range has no includedIssueTypes filter', () => {
      // includedIssueTypes is not defined in range
    });

    Step('And the range has cell "sw1 / col2" with showBadge enabled', () => {
      // Cell is defined in range
    });

    Step('And cell "sw1 / col2" contains 5 issues of mixed types', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3', '4', '5'], ['Bug', 'Task', 'Story', 'Epic', 'Subtask']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then the badge should show "5/10"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '5/10')).to.be.true;
      });
    });
  });

  // === MULTIPLE RANGES ===

  Scenario('SC-MULTI-1: Multiple ranges displayed independently', () => {
    let rangeA: WipLimitRange;
    let rangeB: WipLimitRange;

    Step('Given there is a range "Range A" with WIP limit 3 and cell "sw1 / col2"', () => {
      rangeA = {
        name: 'Range A',
        wipLimit: 3,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And there is a range "Range B" with WIP limit 5 and cell "sw2 / col3"', () => {
      rangeB = {
        name: 'Range B',
        wipLimit: 5,
        cells: [{ swimlane: 'sw2', column: 'col3', showBadge: true }],
      };
    });

    Step('And there are 4 issues in cell "sw1 / col2"', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3', '4']);
      }
    });

    Step('And there are 2 issues in cell "sw2 / col3"', () => {
      const cell = cells.get('sw2/col3');
      if (cell) {
        addIssuesToCell(cell, ['5', '6']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([rangeA, rangeB], shouldCountIssue);
      });
    });

    Step('Then range "Range A" badge should show "4/3" with red color', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '4/3')).to.be.true;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#ff5630');
      });
    });

    Step('And range "Range B" badge should show "2/5" with green color', () => {
      cy.then(() => {
        const cell = cells.get('sw2/col3');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '2/5')).to.be.true;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#1b855c');
      });
    });

    Step('And cell "sw1 / col2" should have red background', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cell!.classList.contains('WipLimit_NotRespected')).to.be.true;
        expect(cell!.style.backgroundColor).to.include('255, 86, 48');
      });
    });

    Step('And cell "sw2 / col3" should not have red background', () => {
      cy.then(() => {
        const cell = cells.get('sw2/col3');
        expect(cell).to.exist;
        expect(cell!.classList.contains('WipLimit_Respected')).to.be.true;
        const bg = cell!.style.backgroundColor;
        expect(bg === '' || bg === 'rgba(0, 0, 0, 0)' || !bg.includes('255, 86, 48')).to.be.true;
      });
    });
  });

  // === DYNAMIC UPDATE ===

  Scenario('SC-UPDATE-1: Board updates when issues are moved', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 3 and cell "sw1 / col2" with showBadge', () => {
      range = {
        name: 'My Range',
        wipLimit: 3,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And there are 2 issues in cell "sw1 / col2"', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2']);
      }
    });

    Step('And the badge shows "2/3" with green color', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '2/3')).to.be.true;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#1b855c');
      });
    });

    Step('When an issue is moved into cell "sw1 / col2"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        if (cell) {
          addIssuesToCell(cell, ['3']);
          // Re-render to update badge
          renderWipLimitCells([range], shouldCountIssue);
        }
      });
    });

    Step('Then the board should re-render', () => {
      // Re-render is done in previous step
    });

    Step('And the badge should update to "3/3" with yellow color', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '3/3')).to.be.true;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#ffd700');
      });
    });
  });

  Scenario('SC-UPDATE-2: Board updates when issues are removed', () => {
    let range: WipLimitRange;

    Step('Given there is a range "My Range" with WIP limit 3 and cell "sw1 / col2" with showBadge', () => {
      range = {
        name: 'My Range',
        wipLimit: 3,
        cells: [{ swimlane: 'sw1', column: 'col2', showBadge: true }],
      };
    });

    Step('And there are 4 issues in cell "sw1 / col2"', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3', '4']);
      }
    });

    Step('And the badge shows "4/3" with red color', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '4/3')).to.be.true;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#ff5630');
      });
    });

    Step('When an issue is moved out of cell "sw1 / col2"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        if (cell) {
          // Remove one issue
          const issue = cell.querySelector('[data-issue-id="4"]');
          if (issue) {
            issue.remove();
          }
          // Re-render to update badge
          renderWipLimitCells([range], shouldCountIssue);
        }
      });
    });

    Step('Then the board should re-render', () => {
      // Re-render is done in previous step
    });

    Step('And the badge should update to "3/3" with yellow color', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '3/3')).to.be.true;
        const color = getBadgeBackgroundColor(cell!);
        expect(color).to.equal('#ffd700');
      });
    });
  });

  // === EDGE CASES ===

  Scenario('SC-EDGE-1: Skip cells not found on current board', () => {
    let range: WipLimitRange;

    Step('Given there is a range "Mixed" with WIP limit 5', () => {
      range = {
        name: 'Mixed',
        wipLimit: 5,
        cells: [
          { swimlane: 'sw1', column: 'col2', showBadge: true },
          { swimlane: 'sw99', column: 'col2', showBadge: false },
        ],
      };
    });

    Step('And the range has cells:', () => {
      // Cells are defined in range
    });

    Step('And swimlane "sw99" does not exist on the board', () => {
      // sw99 is not in swimlanes array
    });

    Step('And there are 3 issues in cell "sw1 / col2"', () => {
      const cell = cells.get('sw1/col2');
      if (cell) {
        addIssuesToCell(cell, ['1', '2', '3']);
      }
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([range], shouldCountIssue);
      });
    });

    Step('Then cell "sw1 / col2" should show badge "3/5"', () => {
      cy.then(() => {
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '3/5')).to.be.true;
      });
    });

    Step('And the non-existent cell should be silently skipped', () => {
      cy.then(() => {
        // sw99/col2 should not exist, and renderWipLimitCells should handle it gracefully
        const nonExistentCell = pageObject.getCellElement('sw99', 'col2');
        expect(nonExistentCell).to.be.null;
        // No error should be thrown, badge should still show for sw1/col2
        const cell = cells.get('sw1/col2');
        expect(cell).to.exist;
        expect(cellHasBadge(cell!, '3/5')).to.be.true;
      });
    });
  });

  Scenario('SC-EDGE-2: Board shows normally when no WIP limit settings exist', () => {
    Step('Given there are no WIP limit on cells settings configured', () => {
      // No ranges defined
    });

    Step('When the board is displayed', () => {
      cy.then(() => {
        renderWipLimitCells([], shouldCountIssue);
      });
    });

    Step('Then no WIP limit badges should be shown', () => {
      cy.then(() => {
        // Check that no badges exist
        const badges = container.querySelectorAll('.WipLimitCellsBadge');
        expect(badges.length).to.equal(0);
      });
    });

    Step('And no dashed borders should be applied', () => {
      cy.then(() => {
        // Check that no border classes exist
        const cellsWithBorders = Array.from(
          container.querySelectorAll(
            '.WipLimitCellsRange_left, .WipLimitCellsRange_right, .WipLimitCellsRange_top, .WipLimitCellsRange_bottom'
          )
        );
        expect(cellsWithBorders.length).to.equal(0);
      });
    });

    Step('And the board should display normally', () => {
      cy.then(() => {
        // Board structure should still exist
        expect(container.querySelectorAll('.ghx-swimlane').length).to.equal(swimlanes.length);
        expect(container.querySelectorAll('.ghx-column').length).to.equal(swimlanes.length * columns.length);
      });
    });
  });
});
