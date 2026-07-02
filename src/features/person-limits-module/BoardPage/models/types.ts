/**
 * Statistics for person(s) WIP limit.
 * Calculated at runtime from board state.
 */
export type PersonLimitStats = {
  id: number;
  persons: Array<{
    name: string;
    displayName?: string;
  }>;
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
  /**
   * When true, the limit is treated as a single shared bucket across all `persons`:
   * every avatar shows the same `total/limit` counter and clicking any avatar
   * highlights tasks of all persons in the limit. When false (default), each avatar
   * has its own per-person counter and click highlight.
   */
  sharedLimit: boolean;
};
