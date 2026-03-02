# TASK-124: Helpers и common.steps для BoardPage

**Status**: TODO  
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

---

## helpers.tsx

```tsx
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { renderWipLimitCells } from '../actions/renderWipLimitCells';
import type { IWipLimitCellsBoardPageObject } from '../pageObject';
import { wipLimitCellsBoardPageObjectToken } from '../pageObject';
import { useWipLimitCellsRuntimeStore } from '../stores';
import type { WipLimitRange, WipLimitCell } from '../../types';

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

export const createRange = (
  name: string,
  wipLimit: number,
  cells: WipLimitCell[],
  options?: { disable?: boolean; includedIssueTypes?: string[] }
): WipLimitRange => ({
  name,
  wipLimit,
  cells,
  disable: options?.disable,
  includedIssueTypes: options?.includedIssueTypes,
});

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
  // ... (existing implementation from board.feature.cy.tsx)
};

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

export const shouldCountIssue = (issue: Element, includedIssueTypes?: string[]): boolean => {
  if (!includedIssueTypes || includedIssueTypes.length === 0) {
    return true;
  }
  const issueType = issue.getAttribute('data-issue-type') || '';
  return includedIssueTypes.includes(issueType);
};
```

---

## steps/common.steps.ts

```typescript
import { Given, When, Then } from '../../../../cypress/support/bdd-runner';
import { renderWipLimitCells } from '../../actions/renderWipLimitCells';
import { createRange, shouldCountIssue, createMockIssue } from '../helpers';
import type { BoardContext } from '../helpers';
import type { WipLimitRange } from '../../../types';

let boardContext: BoardContext;
let ranges: WipLimitRange[] = [];

export const setBoardContext = (ctx: BoardContext) => {
  boardContext = ctx;
};

export const resetRanges = () => {
  ranges = [];
};

// === Background ===

Given('the board is loaded', () => {
  // Setup done in Background
});

Given('there are columns:', (_table: DataTable) => {
  // Columns pre-configured in helpers
});

Given('there are swimlanes:', (_table: DataTable) => {
  // Swimlanes pre-configured in helpers
});

// === Range Setup ===

Given('there is a range {string} with WIP limit {int}', (name: string, limit: number) => {
  ranges.push(createRange(name, limit, []));
});

Given('the range has cells:', (table: DataTable) => {
  const lastRange = ranges[ranges.length - 1];
  table.hashes().forEach(row => {
    lastRange.cells.push({
      swimlane: row.swimlane,
      column: row.column,
      showBadge: row.showBadge === 'true',
    });
  });
});

// === Issues ===

Given('there are {int} issues in cell {string}', (count: number, cellId: string) => {
  const [swimlane, column] = cellId.split(' / ').map(s => s.trim());
  const swId = swimlane === 'sw1' ? 'sw1' : swimlane === 'sw2' ? 'sw2' : swimlane;
  const colId = column === 'col2' ? 'col2' : column === 'col3' ? 'col3' : column;
  
  const cell = boardContext.cells.get(`${swId}/${colId}`);
  if (cell) {
    for (let i = 0; i < count; i++) {
      cell.appendChild(createMockIssue(`${swId}-${colId}-${i}`));
    }
  }
});

// === Board Display ===

When('the board is displayed', () => {
  cy.then(() => {
    renderWipLimitCells(ranges, shouldCountIssue);
  });
});

// === Badge Assertions ===

Then('the cell {string} should show a badge {string}', (cellId: string, badgeText: string) => {
  // ... implementation
});

Then('the cell {string} should not show a badge', (cellId: string) => {
  // ... implementation
});

// ... more step definitions extracted from existing tests
```

---

## Acceptance Criteria

- [ ] `helpers.tsx` создан с createMockBoard, setupBackground, cleanupBoard
- [ ] `steps/common.steps.ts` содержит базовые step definitions
- [ ] Все helper функции переиспользуют логику из старых тестов
- [ ] Типизация без ошибок
