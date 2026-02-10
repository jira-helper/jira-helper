import { create } from 'zustand';
import { produce } from 'immer';
import { getInitialData, type RuntimeStoreState } from './runtimeStore.types';

/**
 * Runtime store for PersonLimits BoardPage.
 *
 * Stores computed statistics and active filter state.
 * Lives while the board page is open.
 *
 * @example
 * ```ts
 * // Read stats
 * const stats = useRuntimeStore(s => s.data.stats);
 *
 * // Update stats
 * useRuntimeStore.getState().actions.setStats(newStats);
 *
 * // Toggle filter
 * useRuntimeStore.getState().actions.toggleActiveLimitId(123456);
 */
export const useRuntimeStore = create<RuntimeStoreState>()(set => ({
  data: getInitialData(),
  actions: {
    setStats: stats =>
      set(
        produce(state => {
          state.data.stats = stats;
        })
      ),

    setActiveLimitId: id =>
      set(
        produce(state => {
          state.data.activeLimitId = id;
        })
      ),

    setCssSelectorOfIssues: selector =>
      set(
        produce(state => {
          state.data.cssSelectorOfIssues = selector;
        })
      ),

    toggleActiveLimitId: id =>
      set(
        produce(state => {
          if (state.data.activeLimitId === id) {
            state.data.activeLimitId = null;
          } else {
            state.data.activeLimitId = id;
          }
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
  actions: useRuntimeStore.getState().actions,
});
