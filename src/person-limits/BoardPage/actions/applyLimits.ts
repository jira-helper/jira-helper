import { createAction } from 'src/shared/action';
import { personLimitsBoardPageObjectToken } from '../pageObject';
import { useRuntimeStore } from '../stores';
import { calculateStats } from './calculateStats';

/**
 * Apply person WIP limits to the board.
 *
 * 1. Calculates statistics for each person's limit (reads from property store)
 * 2. Updates the runtime store with stats
 * 3. Highlights issues that exceed their person's limit
 */
export const applyLimits = createAction({
  name: 'applyLimits',
  handler(): void {
    const pageObject = this.di.inject(personLimitsBoardPageObjectToken);
    const { actions } = useRuntimeStore.getState();
    const { cssSelectorOfIssues } = useRuntimeStore.getState().data;

    // Calculate stats (reads limits from property store)
    const stats = calculateStats();
    actions.setStats(stats);

    // Reset all issue backgrounds
    const allIssues = pageObject.getIssues(cssSelectorOfIssues);
    allIssues.forEach(issue => {
      pageObject.resetIssueBackgroundColor(issue);
    });

    // Highlight issues exceeding limit
    stats.forEach(personLimit => {
      if (personLimit.issues.length > personLimit.limit) {
        personLimit.issues.forEach(issue => {
          pageObject.setIssueBackgroundColor(issue, '#ff5630');
        });
      }
    });
  },
});
