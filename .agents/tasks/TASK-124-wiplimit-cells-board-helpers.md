# TASK-124: Helpers и common.steps для BoardPage

**Status**: DONE  
**Epic**: [EPIC-12](./EPIC-12-wiplimit-cells-bdd-refactoring.md)  
**Phase**: 2 - BoardPage Refactoring

---

## Цель

Создать инфраструктуру для BDD тестов BoardPage: `helpers.tsx` и `steps/common.steps.ts`.

## Создаваемые файлы

```
src/wiplimit-on-cells/BoardPage/features/
├── helpers.tsx
└── steps/
    └── common.steps.ts
```

## Референсы

- `src/column-limits/BoardPage/features/helpers.tsx` — пример helpers
- `src/column-limits/BoardPage/features/steps/common.steps.ts` — пример steps
- `src/wiplimit-on-cells/BoardPage/board.feature.cy.tsx` — старые тесты (извлечь логику)
- `cypress/support/gherkin-steps/common.ts` — глобальные шаги (НЕ дублировать)

---

## helpers.tsx

```tsx
/// <reference types="cypress" />
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import type { IWipLimitCellsBoardPageObject } from '../pageObject';
import { wipLimitCellsBoardPageObjectToken } from '../pageObject';
import { useWipLimitCellsRuntimeStore } from '../stores';
import type { WipLimitRange, WipLimitCell } from '../../types';

// --- Fixtures matching feature Background ---

export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
  { id: 'sw3', name: 'QA' },
];

// Name to ID mappings for step definitions
export const columnNameToId: Record<string, string> = {
  'To Do': 'col1',
  'In Progress': 'col2',
  Review: 'col3',
  Done: 'col4',
};

export const swimlaneNameToId: Record<string, string> = {
  Frontend: 'sw1',
  Backend: 'sw2',
  QA: 'sw3',
};

// --- Range helpers ---

export const createRange = (
  name: string,
  wipLimit: number,
  cells: WipLimitCell[] = [],
  options?: { disable?: boolean; includedIssueTypes?: string[] }
): WipLimitRange => ({
  name,
  wipLimit,
  cells,
  disable: options?.disable,
  includedIssueTypes: options?.includedIssueTypes,
});

// --- DOM helpers ---

export const createMockSwimlane = (id: string, name: string): HTMLElement => {
  const swimlane = document.createElement('div');
  swimlane.className = 'ghx-swimlane';
  swimlane.setAttribute('swimlane-id', id);
  swimlane.setAttribute('data-swimlane-name', name);
  return swimlane;
};

export const createMockColumn = (id: string, name: string): HTMLElement => {
  const column = document.createElement('div');
  column.className = 'ghx-column';
  column.setAttribute('data-column-id', id);
  column.setAttribute('data-column-name', name);
  return column;
};

export const createMockIssue = (id: string, issueType: string = 'Task'): HTMLElement => {
  const issue = document.createElement('div');
  issue.className = 'ghx-issue';
  issue.setAttribute('data-issue-id', id);
  issue.setAttribute('data-issue-type', issueType);
  issue.textContent = `Issue ${id}`;
  return issue;
};

export interface BoardContext {
  container: HTMLElement;
  cells: Map<string, HTMLElement>;
  pageObject: IWipLimitCellsBoardPageObject;
}

export const createMockBoard = (): BoardContext => {
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

  const pageObject = createMockPageObject(cells);

  return { container, cells, pageObject };
};

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

// --- Background setup ---

export const setupBackground = (): BoardContext => {
  globalContainer.reset();
  registerLogger(globalContainer);
  useWipLimitCellsRuntimeStore.getState().actions.reset();

  const board = createMockBoard();

  globalContainer.register({
    token: wipLimitCellsBoardPageObjectToken,
    value: board.pageObject,
  });

  useWipLimitCellsRuntimeStore.getState().actions.setCssSelectorOfIssues('.ghx-issue');

  cy.then(() => {
    const root = document.querySelector('[data-cy-root]') || document.body;
    root.appendChild(board.container);
  });

  return board;
};

export const cleanupBoard = (container: HTMLElement) => {
  cy.then(() => {
    container.remove();
  });
};

// --- Issue helpers ---

export const addIssuesToCell = (cell: HTMLElement, count: number, issueTypes: string[] = []): void => {
  for (let i = 0; i < count; i++) {
    const issueType = issueTypes[i] || 'Task';
    const issue = createMockIssue(`issue-${Date.now()}-${i}`, issueType);
    cell.appendChild(issue);
  }
};

export const shouldCountIssue = (issue: Element, includedIssueTypes?: string[]): boolean => {
  if (!includedIssueTypes || includedIssueTypes.length === 0) {
    return true;
  }
  const issueType = issue.getAttribute('data-issue-type') || '';
  return includedIssueTypes.includes(issueType);
};

// --- Badge/Cell assertion helpers ---

export const cellHasBadge = (cell: HTMLElement, expectedText: string): boolean => {
  const badge = cell.querySelector('.WipLimitCellsBadge');
  return badge?.textContent?.trim() === expectedText;
};

export const getBadgeBackgroundColor = (cell: HTMLElement): string | null => {
  const badge = cell.querySelector('.WipLimitCellsBadge');
  if (!badge) return null;
  const style = badge.getAttribute('style');
  if (!style) return null;
  const match = style.match(/background-color:\s*([^;]+)/);
  return match ? match[1].trim() : null;
};

export const cellHasBorder = (cell: HTMLElement, side: 'top' | 'bottom' | 'left' | 'right'): boolean => {
  const className = `WipLimitCellsRange_${side}`;
  return cell.classList.contains(className);
};

// --- Issue counter for unique IDs ---

let issueCounter = 0;

export const resetIssueCounter = () => {
  issueCounter = 0;
};

export const getNextIssueId = () => {
  issueCounter += 1;
  return `issue-${issueCounter}`;
};
```

---

## steps/common.steps.ts

```typescript
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
  getBadgeBackgroundColor,
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
const pendingRanges: Map<string, {
  wipLimit: number;
  disable: boolean;
  includedIssueTypes: string[];
  cells: WipLimitCell[];
}> = new Map();

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

Then(/^badges should show "([^"]*)"$/, (badgeText: string) => {
  cy.get('.WipLimitCellsBadge').should('contain', badgeText);
});

// --- Color Assertions ---

Then(/^the badge should have (?:green |yellow |red )?background color "([^"]*)"$/, (expectedColor: string) => {
  cy.get('.WipLimitCellsBadge').should('have.attr', 'style').and('include', expectedColor);
});

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

Then(/^the cell "([^"]*)" should not have dashed border on (top|bottom|left|right)$/, (cellName: string, side: string) => {
  const [swName, colName] = cellName.split(' / ').map(s => s.trim());
  const swimlaneId = swimlaneNameToId[swName] || swName;
  const columnId = columnNameToId[colName] || colName;

  cy.then(() => {
    const cell = boardContext.cells.get(`${swimlaneId}/${columnId}`);
    expect(cell).to.exist;
    expect(cellHasBorder(cell!, side as 'top' | 'bottom' | 'left' | 'right')).to.be.false;
  });
});

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
```

---

## Acceptance Criteria

- [ ] `helpers.tsx` создан с полными helper функциями из `board.feature.cy.tsx`
- [ ] `steps/common.steps.ts` содержит все step definitions для BoardPage
- [ ] Используется DataTable формат для ranges и cells
- [ ] Name-to-ID mappings для swimlanes и columns
- [ ] Типизация без ошибок
- [ ] Линтер проходит: `npx eslint src/wiplimit-on-cells/BoardPage/features/ --fix`

---

## Результаты

**Дата**: 2025-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/wiplimit-on-cells/BoardPage/features/helpers.tsx` с полными helper функциями
- Создан `src/wiplimit-on-cells/BoardPage/features/steps/common.steps.ts` со всеми step definitions
- Используется DataTable формат для ranges и cells
- Name-to-ID mappings для swimlanes и columns (columnNameToId, swimlaneNameToId)
- Экспорт setBoardContext, getRanges для интеграции с defineFeature

**Проблемы и решения**:

1. **@typescript-eslint/no-use-before-define**: `createMockPageObject` использовался до определения — перенесён выше `createMockBoard`
2. **@typescript-eslint/no-unused-vars**: `getBadgeBackgroundColor` импортирован, но не используется в steps — удалён из импорта (оставлен в helpers для будущих сценариев)
