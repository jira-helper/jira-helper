import type React from 'react';

type CardPageObject = {
  getIssueId(): string;
  getCardElement(): Element;
};

export interface SwimlaneElement {
  id: string;
  element: Element;
  header: Element;
}

export interface IssueCountOptions {
  excludeDone?: boolean;
  excludeSubtasks?: boolean;
  includedIssueTypes?: string[];
}

export type ColumnIssueCountOptions = {
  ignoredSwimlanes?: string[];
  includedIssueTypes?: string[];
  cssFilter?: string;
};

export interface IBoardPagePageObject {
  selectors: {
    pool: string;
    issue: string;
    flagged: string;
    grabber: string;
    grabberTransparent: string;
    sidebar: string;
    column: string;
    columnHeader: string;
    columnTitle: string;
    daysInColumn: string;
    swimlaneHeader: string;
    swimlaneRow: string;
    avatarImg: string;
    issueType: string;
    parentGroup: string;
  };

  classlist: {
    flagged: string;
  };

  getColumns(): string[];
  listenCards(callback: (cards: CardPageObject[]) => void): () => void;
  getColumnOfIssue(issueId: string): string;
  getDaysInColumn(issueId: string): number | null;
  hideDaysInColumn(): void;
  getHtml(): string;
  getSwimlanes(): SwimlaneElement[];
  getSwimlaneHeader(swimlaneId: string): Element | null;
  getIssueCountInSwimlane(swimlaneId: string, options?: IssueCountOptions): number;
  getIssueCountByColumn(swimlaneId: string, options?: IssueCountOptions): number[];
  getIssueCountForColumns(swimlaneId: string, columns: string[], options?: IssueCountOptions): number;
  insertSwimlaneComponent(header: Element, component: React.ReactNode, key: string): void;
  removeSwimlaneComponent(header: Element, key: string): void;
  highlightSwimlane(header: Element, exceeded: boolean): void;

  /**
   * Ordered column IDs from the board header row.
   * Reads from `.ghx-first ul.ghx-columns > li.ghx-column` (and test variant `ul.ghx-columns.ghx-first`).
   */
  getOrderedColumnIds(): string[];

  /**
   * Column header element by column ID (header row, not swimlane cell).
   */
  getColumnHeaderElement(columnId: string): HTMLElement | null;

  /**
   * Ordered columns (id + display name) from the board header row.
   * Combines getOrderedColumnIds() with column title text from `.ghx-column-title` or `h2`.
   */
  getOrderedColumns(): Array<{ id: string; name: string }>;

  /** All swimlane IDs (`getSwimlanes().map(s => s.id)`). */
  getSwimlaneIds(): string[];

  /**
   * Count issues in a column across swimlanes (excludes `.ghx-done` by default, like legacy column-limits).
   */
  getIssueCountInColumn(columnId: string, options?: ColumnIssueCountOptions): number;

  /** Apply inline styles to the column header element. */
  styleColumnHeader(columnId: string, styles: Partial<CSSStyleDeclaration>): void;

  /**
   * Clear group-limit inline styles on the column header (background, top border, radii).
   * Used before re-applying so columns removed from a group lose previous decoration.
   */
  resetColumnHeaderStyles(columnId: string): void;

  /** Insert HTML at the end of the column header (`insertAdjacentHTML` `beforeend`). */
  insertColumnHeaderHtml(columnId: string, html: string): void;

  /** Remove descendants of the column header matching `selector`. */
  removeColumnHeaderElements(columnId: string, selector: string): void;

  /**
   * Set background color on column cells across swimlanes.
   * @param excludedSwimlaneIds — swimlanes to skip (not highlighted).
   */
  highlightColumnCells(columnId: string, color: string, excludedSwimlaneIds?: string[]): void;

  /** Clear inline background on all column cells for this column id across swimlanes. */
  resetColumnCellStyles(columnId: string): void;

  // === Person-limits: Queries ===

  /** Get all issue card elements matching CSS selector. */
  getIssueElements(cssSelector: string): Element[];

  /** Issue cards inside a column element (scoped `querySelectorAll`). */
  getIssueElementsInColumn(column: Element, cssSelector: string): Element[];

  /** Parse assignee name from issue card's avatar tooltip / alt. */
  getAssigneeFromIssue(issue: Element): string | null;

  /** Issue type from `.ghx-type` title or textContent (person-limits semantics). */
  getIssueTypeFromIssue(issue: Element): string | null;

  /** Column ID for an issue (closest `.ghx-column` `data-column-id`). */
  getColumnIdOfIssue(issue: Element): string | null;

  /** Column ID from a column element (`data-column-id`). */
  getColumnIdFromColumn(column: Element): string | null;

  /** Swimlane ID for an issue (closest `.ghx-swimlane` `swimlane-id`). */
  getSwimlaneIdOfIssue(issue: Element): string | null;

  /** Whether the board uses custom swimlanes (`aria-label` contains `custom`). */
  hasCustomSwimlanes(): boolean;

  /** All `.ghx-column` elements on the board (distinct from `getColumns()` string titles). */
  getColumnElements(): Element[];

  /** Column elements inside a swimlane row. */
  getColumnsInSwimlane(swimlane: Element): Element[];

  /** Parent group elements (subtask grouping). */
  getParentGroups(): Element[];

  /** Count issues matching selector; hidden = has `no-visibility` class. */
  countIssueVisibility(
    element: Element,
    cssSelector: string
  ): {
    total: number;
    hidden: number;
  };

  // === Person-limits: Commands ===

  setIssueBackgroundColor(issue: Element, color: string): void;

  resetIssueBackgroundColor(issue: Element): void;

  setIssueVisibility(issue: Element, visible: boolean): void;

  setSwimlaneVisibility(swimlane: Element, visible: boolean): void;

  setParentGroupVisibility(group: Element, visible: boolean): void;
}
