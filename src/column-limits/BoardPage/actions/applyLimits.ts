import { createAction } from 'src/shared/action';
import { useColumnLimitsRuntimeStore } from '../stores';
import { calculateGroupStats } from './calculateGroupStats';
import { styleColumnHeaders } from './styleColumnHeaders';
import { styleColumnsWithLimits } from './styleColumnsWithLimits';

/**
 * Apply column limits to the board.
 *
 * Orchestrates the full limit application process:
 * 1. Calculates statistics for each group (reads from property store)
 * 2. Updates runtime store with computed stats
 * 3. Styles column headers with group colors
 * 4. Highlights columns that exceed limits and inserts badges
 *
 * Call this action whenever the board state changes (DOM updates, issue moves, etc.).
 */
export const applyLimits = createAction({
  name: 'applyLimits',
  handler(): void {
    const { actions } = useColumnLimitsRuntimeStore.getState();

    // Calculate stats
    const stats = calculateGroupStats();
    actions.setGroupStats(stats);

    // Apply styles
    styleColumnHeaders();
    styleColumnsWithLimits();
  },
});
