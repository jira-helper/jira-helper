import type { IWipLimitCellsBoardPageObject } from './IWipLimitCellsBoardPageObject';

/**
 * Production implementation of WipLimitCells BoardPage DOM operations.
 */
export const WipLimitCellsBoardPageObject: IWipLimitCellsBoardPageObject = {
  selectors: {
    swimlane: '.ghx-swimlane',
    column: '.ghx-column',
  },

  // === QUERIES ===

  getAllCells(): Element[][] {
    const cellsArray: Element[][] = [];
    const rows = Array.from(document.querySelectorAll(this.selectors.swimlane));

    for (const row of rows) {
      const rowCells: Element[] = [];
      const cells = Array.from(row.querySelectorAll(this.selectors.column));
      for (const cell of cells) {
        rowCells.push(cell);
      }
      cellsArray.push(rowCells);
    }

    return cellsArray;
  },

  getCellElement(swimlaneId: string, columnId: string): Element | null {
    const selector = `[swimlane-id='${swimlaneId}'] [data-column-id='${columnId}']`;
    return document.querySelector(selector);
  },

  getIssuesInCell(cell: Element, cssSelector: string): Element[] {
    return Array.from(cell.querySelectorAll(cssSelector));
  },

  // === COMMANDS ===

  addCellClass(cell: Element, className: string): void {
    cell.classList.add(className);
  },

  removeCellClass(cell: Element, className: string): void {
    cell.classList.remove(className);
  },

  setCellBackgroundColor(cell: Element, color: string): void {
    (cell as HTMLElement).style.backgroundColor = color;
  },

  insertBadge(cell: Element, html: string): void {
    (cell as HTMLElement).insertAdjacentHTML('afterbegin', html);
  },
};
