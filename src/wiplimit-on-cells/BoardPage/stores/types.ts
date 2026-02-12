/**
 * Runtime store state for WipLimitOnCells BoardPage.
 *
 * Stores runtime state for cell WIP limits visualization.
 * Lives while the board page is open.
 */
export interface WipLimitCellsRuntimeStoreState {
  /** CSS selector for counting issues in cells */
  cssSelectorOfIssues: string;
  actions: {
    setCssSelectorOfIssues: (selector: string) => void;
    reset: () => void;
  };
}
