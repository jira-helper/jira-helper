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
