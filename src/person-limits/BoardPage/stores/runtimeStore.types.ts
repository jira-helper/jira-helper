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

/**
 * Runtime store state for PersonLimits BoardPage.
 *
 * Stores computed statistics and UI state for the board visualization.
 */
export type RuntimeStoreData = {
  /** Computed stats for each person's limit */
  stats: PersonLimitStats[];
  /** Currently selected limit for filtering (null = show all) */
  activeLimitId: number | null;
  /** CSS selector for issue cards (from board config) */
  cssSelectorOfIssues: string;
};

export type RuntimeStoreState = {
  data: RuntimeStoreData;
  actions: {
    setStats: (stats: PersonLimitStats[]) => void;
    setActiveLimitId: (id: number | null) => void;
    setCssSelectorOfIssues: (selector: string) => void;
    toggleActiveLimitId: (id: number) => void;
    reset: () => void;
  };
};

export const getInitialData = (): RuntimeStoreData => ({
  stats: [],
  activeLimitId: null,
  cssSelectorOfIssues: '.ghx-issue',
});
