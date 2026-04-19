/**
 * Statistics for a single person's WIP limit.
 * Calculated at runtime from board state.
 */
export type PersonLimitStats = {
  id: number;
  person: {
    name: string;
    /** @deprecated Use `name` instead. */
    displayName?: string;
  };
  limit: number;
  /** Issues that match this person's limit criteria */
  issues: Element[];
  /** Columns this limit applies to (empty = all columns) */
  columns: Array<{ id: string; name: string }>;
  /** Swimlanes this limit applies to (empty = all swimlanes) */
  swimlanes: Array<{ id: string; name: string }>;
  /** Issue types to count (undefined/empty = all types) */
  includedIssueTypes?: string[];
  /** When true, clicking avatar shows all person's issues; when false, only limit-matching */
  showAllPersonIssues: boolean;
};
