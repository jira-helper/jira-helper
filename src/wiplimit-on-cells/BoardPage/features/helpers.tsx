/// <reference types="cypress" />
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
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

// --- Background setup ---

export const setupBackground = (): BoardContext => {
  globalContainer.reset();
  registerLogger(globalContainer);
  useWipLimitCellsRuntimeStore.getState().actions.reset();

  const board = createMockBoard();

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
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
