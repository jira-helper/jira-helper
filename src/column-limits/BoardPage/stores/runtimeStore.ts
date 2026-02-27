import { create } from 'zustand';
import { produce } from 'immer';
import { getInitialData, type RuntimeStoreState } from './runtimeStore.types';

/**
 * Runtime store for ColumnLimits BoardPage.
 *
 * Stores computed statistics and runtime configuration.
 * Lives while the board page is open.
 *
 * @example
 * ```ts
 * // Read group stats
 * const stats = useColumnLimitsRuntimeStore(s => s.data.groupStats);
 *
 * // Update stats
 * useColumnLimitsRuntimeStore.getState().actions.setGroupStats(newStats);
 *
 * // Set CSS selector
 * useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('.ghx-subtask');
 * ```
 */
export const useColumnLimitsRuntimeStore = create<RuntimeStoreState>()(set => ({
  data: getInitialData(),
  actions: {
    setGroupStats: stats =>
      set(
        produce(state => {
          state.data.groupStats = stats;
        })
      ),

    setCssNotIssueSubTask: css =>
      set(
        produce(state => {
          state.data.cssNotIssueSubTask = css;
        })
      ),

    setIgnoredSwimlanes: ids =>
      set(
        produce(state => {
          state.data.ignoredSwimlanes = ids;
        })
      ),

    reset: () =>
      set({
        data: getInitialData(),
      }),
  },
}));

/**
 * Get initial state for testing.
 * Use in beforeEach to reset store between tests.
 */
export const getInitialState = (): RuntimeStoreState => ({
  data: getInitialData(),
  actions: useColumnLimitsRuntimeStore.getState().actions,
});
