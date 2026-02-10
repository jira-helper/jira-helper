/**
 * Interface for PersonLimits BoardPage DOM operations.
 *
 * All DOM access is encapsulated here to:
 * - Decouple actions from Jira DOM structure
 * - Enable easy mocking in tests
 * - Centralize DOM selectors
 */
export interface IPersonLimitsBoardPageObject {
  selectors: {
    issue: string;
    avatarImg: string;
    issueType: string;
    column: string;
    swimlane: string;
    swimlaneHeader: string;
    parentGroup: string;
  };

  // === Queries (read DOM) ===

  /**
   * Get all issue cards on the board
   */
  getIssues(cssSelector: string): Element[];

  /**
   * Get assignee name from issue card
   * Parses from avatar alt/data-tooltip attribute
   */
  getAssigneeFromIssue(issue: Element): string | null;

  /**
   * Get issue type from issue card
   * Reads from .ghx-type element title or textContent
   */
  getIssueType(issue: Element): string | null;

  /**
   * Get column ID for an issue (finds parent column)
   */
  getColumnId(issue: Element): string | null;

  /**
   * Get column ID directly from a column element
   */
  getColumnIdFromColumn(column: Element): string | null;

  /**
   * Get swimlane ID for an issue
   */
  getSwimlaneId(issue: Element): string | null;

  /**
   * Check if board has custom swimlanes
   */
  hasCustomSwimlanes(): boolean;

  /**
   * Get all swimlanes on the board
   */
  getSwimlanes(): Element[];

  /**
   * Get all columns within a swimlane
   */
  getColumnsInSwimlane(swimlane: Element): Element[];

  /**
   * Get all columns on the board (when no custom swimlanes)
   */
  getColumns(): Element[];

  /**
   * Get all parent groups (for subtasks)
   */
  getParentGroups(): Element[];

  /**
   * Count visible and hidden issues in an element
   */
  countIssueVisibility(
    element: Element,
    cssSelector: string
  ): {
    total: number;
    hidden: number;
  };

  // === Commands (mutate DOM) ===

  /**
   * Set background color on an issue card
   */
  setIssueBackgroundColor(issue: Element, color: string): void;

  /**
   * Reset background color on an issue card
   */
  resetIssueBackgroundColor(issue: Element): void;

  /**
   * Set visibility of an issue card
   */
  setIssueVisibility(issue: Element, visible: boolean): void;

  /**
   * Set visibility of a swimlane
   */
  setSwimlaneVisibility(swimlane: Element, visible: boolean): void;

  /**
   * Set visibility of a parent group
   */
  setParentGroupVisibility(group: Element, visible: boolean): void;
}
