import map from '@tinkoff/utils/array/map';
import type { IColumnLimitsBoardPageObject } from './IColumnLimitsBoardPageObject';

/**
 * Production implementation of ColumnLimits BoardPage DOM operations.
 *
 * Extracts DOM manipulation logic from BoardPage class to enable:
 * - Testability (easy mocking)
 * - Reusability (can be used in actions)
 * - Separation of concerns (DOM vs business logic)
 */
export class ColumnLimitsBoardPageObject implements IColumnLimitsBoardPageObject {
  /**
   * Get ordered column IDs from the board header.
   * Reads from `.ghx-first ul.ghx-columns > li.ghx-column` elements.
   */
  getOrderedColumnIds(): string[] {
    // Support both structures:
    // 1. ul.ghx-columns.ghx-first > li.ghx-column (test structure)
    // 2. .ghx-first ul.ghx-columns > li.ghx-column (production structure)
    const columns = document.querySelectorAll<HTMLElement>(
      'ul.ghx-columns.ghx-first > li.ghx-column, .ghx-first ul.ghx-columns > li.ghx-column'
    );
    return Array.from(columns)
      .map((column: HTMLElement) => {
        // Try dataset.columnId first, fallback to getAttribute
        return (column.dataset.columnId || column.getAttribute('data-column-id') || '') as string;
      })
      .filter(Boolean);
  }

  /**
   * Get column element by column ID.
   * Looks for header column element in `.ghx-column-header-group` or `ul.ghx-columns`.
   * This ensures we get the header element, not a column cell in a swimlane.
   */
  getColumnElement(columnId: string): HTMLElement | null {
    // First try to find in header structure (preferred)
    const headerColumn = document.querySelector<HTMLElement>(
      `.ghx-column-header-group .ghx-column[data-id="${columnId}"], ul.ghx-columns .ghx-column[data-id="${columnId}"]`
    );
    if (headerColumn) {
      return headerColumn;
    }
    // Fallback to any column with data-id (for backward compatibility)
    return document.querySelector<HTMLElement>(`.ghx-column[data-id="${columnId}"]`);
  }

  /**
   * Count issues in a column with optional filtering.
   * Filters by:
   * - Ignored swimlanes (excludes issues from specified swimlanes)
   * - Issue types (includes only specified types if provided)
   * - Done status (excludes `.ghx-done` issues)
   * - Subtasks (if cssNotIssueSubTask selector provided)
   */
  getIssuesInColumn(
    columnId: string,
    ignoredSwimlanes: string[],
    includedIssueTypes?: string[],
    cssNotIssueSubTask: string = ''
  ): number {
    // Build swimlane filter: if ignoredSwimlanes is empty, select all swimlanes
    // Otherwise, exclude ignored swimlanes
    const swimlanesFilter =
      ignoredSwimlanes.length > 0
        ? ignoredSwimlanes.map(swimlaneId => `:not([swimlane-id="${swimlaneId}"])`).join('')
        : '';

    // Use more specific selector that matches test DOM structure
    // In tests, issues are directly inside .ghx-column elements within .ghx-swimlane elements
    const selector = swimlanesFilter
      ? `.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"] .ghx-issue:not(.ghx-done)${cssNotIssueSubTask}`
      : `.ghx-swimlane .ghx-column[data-column-id="${columnId}"] .ghx-issue:not(.ghx-done)${cssNotIssueSubTask}`;

    const issues = document.querySelectorAll(selector);

    if (!includedIssueTypes || includedIssueTypes.length === 0) {
      return issues.length;
    }

    return Array.from(issues).filter(issue => this.shouldCountIssue(issue, includedIssueTypes)).length;
  }

  /**
   * Apply styles to a column element.
   * Uses Object.assign to merge styles with existing inline styles.
   */
  styleColumn(columnId: string, styles: Partial<CSSStyleDeclaration>): void {
    const columnElement = this.getColumnElement(columnId);
    if (!columnElement) return;

    Object.assign(columnElement.style, styles);
  }

  /**
   * Insert HTML badge into a column header.
   * Inserts HTML at the end of the column element (beforeend position).
   */
  insertBadge(columnId: string, html: string): void {
    const columnElement = this.getColumnElement(columnId);
    if (!columnElement) {
      return;
    }

    columnElement.insertAdjacentHTML('beforeend', html);
  }

  /**
   * Remove all badges from a column header.
   * Removes elements with class matching limitColumnBadge.
   * Uses data attribute to identify badges since CSS modules hash class names.
   */
  removeBadges(columnId: string): void {
    const columnElement = this.getColumnElement(columnId);
    if (!columnElement) return;

    // Remove badges by data attribute (more reliable than class name with CSS modules)
    const badges = columnElement.querySelectorAll('[data-column-limits-badge]');
    badges.forEach(badge => badge.remove());
  }

  /**
   * Get all swimlane IDs from the board.
   * Reads `swimlane-id` attribute from all `.ghx-swimlane` elements.
   */
  getSwimlaneIds(): string[] {
    const swimlanes = document.querySelectorAll<HTMLElement>('.ghx-swimlane');
    return Array.from(swimlanes)
      .map(swimlane => swimlane.getAttribute('swimlane-id'))
      .filter((id): id is string => id !== null);
  }

  /**
   * Check if an issue should be counted based on issue type filter.
   * Extracts issue type from `.ghx-type` element's title attribute.
   * Title format can be: "Idea", "Тип запроса: Idea", etc.
   */
  shouldCountIssue(issue: Element, includedIssueTypes?: string[]): boolean {
    if (!includedIssueTypes || includedIssueTypes.length === 0) {
      return true; // If no filter, count all issues
    }

    const issueType = this.getIssueTypeFromCard(issue);
    return issueType ? includedIssueTypes.includes(issueType) : false;
  }

  /**
   * Extract issue type from issue card element.
   * Reads from `.ghx-type` element's title attribute.
   * Handles both simple format ("Idea") and localized format ("Тип запроса: Idea").
   */
  private getIssueTypeFromCard(card: Element): string | null {
    const typeElement = card.querySelector('.ghx-type');
    if (!typeElement) return null;

    const title = typeElement.getAttribute('title');
    if (!title) return null;

    // Extract type name from title attribute
    // Title format can be: "Idea", "Тип запроса: Idea", etc.
    const typeName = title.includes(':') ? title.split(':')[1].trim() : title.trim();
    return typeName || null;
  }
}
