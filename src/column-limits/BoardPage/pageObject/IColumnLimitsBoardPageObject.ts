/**
 * Interface for ColumnLimits BoardPage DOM operations.
 *
 * All DOM access is encapsulated here to:
 * - Decouple actions from Jira DOM structure
 * - Enable easy mocking in tests
 * - Centralize DOM selectors
 */
export interface IColumnLimitsBoardPageObject {
  /**
   * Get ordered column IDs from the board header.
   * Returns array of column IDs in display order.
   */
  getOrderedColumnIds(): string[];

  /**
   * Get column element by column ID.
   * @param columnId - Column ID to find
   * @returns Column element or null if not found
   */
  getColumnElement(columnId: string): HTMLElement | null;

  /**
   * Count issues in a column, optionally filtering by swimlanes and issue types.
   * @param columnId - Column ID to count issues in
   * @param ignoredSwimlanes - Array of swimlane IDs to exclude from count
   * @param includedIssueTypes - Optional array of issue types to include (if empty, counts all)
   * @param cssNotIssueSubTask - Optional CSS selector to exclude subtasks (e.g., ':not(.ghx-issue-subtask)')
   * @returns Number of issues matching criteria
   */
  getIssuesInColumn(
    columnId: string,
    ignoredSwimlanes: string[],
    includedIssueTypes?: string[],
    cssNotIssueSubTask?: string
  ): number;

  /**
   * Apply styles to a column element.
   * @param columnId - Column ID to style
   * @param styles - Partial CSSStyleDeclaration to apply
   */
  styleColumn(columnId: string, styles: Partial<CSSStyleDeclaration>): void;

  /**
   * Insert HTML badge into a column header.
   * @param columnId - Column ID to insert badge into
   * @param html - HTML string to insert
   */
  insertBadge(columnId: string, html: string): void;

  /**
   * Remove all badges from a column header.
   * @param columnId - Column ID to remove badges from
   */
  removeBadges(columnId: string): void;

  /**
   * Get all swimlane IDs from the board.
   * @returns Array of swimlane ID strings
   */
  getSwimlaneIds(): string[];

  /**
   * Check if an issue should be counted based on issue type filter.
   * @param issue - Issue element to check
   * @param includedIssueTypes - Optional array of issue types to include (if empty, counts all)
   * @returns true if issue should be counted
   */
  shouldCountIssue(issue: Element, includedIssueTypes?: string[]): boolean;
}
