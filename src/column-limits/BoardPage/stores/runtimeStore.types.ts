/**
 * Statistics for a single group's column limit.
 * Calculated at runtime from board state.
 */
export type GroupStats = {
  groupId: string;
  groupName: string;
  columns: string[];
  currentCount: number;
  limit: number;
  isOverLimit: boolean;
  color: string;
  /** Swimlane IDs to ignore when counting/styling for this group */
  ignoredSwimlanes: string[];
};

/**
 * Runtime store state for ColumnLimits BoardPage.
 *
 * Stores computed statistics and runtime configuration for the board visualization.
 */
export type RuntimeData = {
  /** Computed stats for each group's column limits */
  groupStats: GroupStats[];
  /** CSS selector to exclude subtasks from counting */
  cssNotIssueSubTask: string;
};

export type RuntimeActions = {
  setGroupStats: (stats: GroupStats[]) => void;
  setCssNotIssueSubTask: (css: string) => void;
  reset: () => void;
};

export type RuntimeStoreState = {
  data: RuntimeData;
  actions: RuntimeActions;
};

/**
 * Get initial runtime data.
 * Used for store initialization and reset.
 */
export const getInitialData = (): RuntimeData => ({
  groupStats: [],
  cssNotIssueSubTask: '',
});
