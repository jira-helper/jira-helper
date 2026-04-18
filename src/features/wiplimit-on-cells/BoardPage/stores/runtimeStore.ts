import { create } from 'zustand';
import { produce } from 'immer';
import type { WipLimitCellsRuntimeStoreState } from './types';

/**
 * Runtime store for WipLimitOnCells BoardPage.
 *
 * Stores CSS selector for counting issues in cells.
 * Lives while the board page is open.
 *
 * @example
 * ```ts
 * // Read selector
 * const selector = useWipLimitCellsRuntimeStore(s => s.cssSelectorOfIssues);
 *
 * // Update selector
 * useWipLimitCellsRuntimeStore.getState().actions.setCssSelectorOfIssues('.ghx-issue');
 *
 * // Reset store
 * useWipLimitCellsRuntimeStore.getState().actions.reset();
 * ```
 */
export const useWipLimitCellsRuntimeStore = create<WipLimitCellsRuntimeStoreState>()(set => ({
  cssSelectorOfIssues: '',
  actions: {
    setCssSelectorOfIssues: selector =>
      set(
        produce(state => {
          state.cssSelectorOfIssues = selector;
        })
      ),

    reset: () =>
      set({
        cssSelectorOfIssues: '',
      }),
  },
}));

/**
 * Get initial state for testing.
 * Use in beforeEach to reset store between tests.
 */
export const getInitialState = (): WipLimitCellsRuntimeStoreState => ({
  cssSelectorOfIssues: '',
  actions: useWipLimitCellsRuntimeStore.getState().actions,
});
