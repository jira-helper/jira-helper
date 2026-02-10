import { createAction } from 'src/shared/action';
import { personLimitsBoardPageObjectToken } from '../pageObject';
import { useRuntimeStore } from '../stores';
import { calculateStats } from './calculateStats';

type PersonLimitInput = {
  id: number;
  person: {
    displayName: string;
    name: string;
    avatar: string;
  };
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
  limit: number;
  includedIssueTypes?: string[];
};

/**
 * Apply person WIP limits to the board.
 *
 * 1. Calculates statistics for each person's limit
 * 2. Updates the runtime store with stats
 * 3. Highlights issues that exceed their person's limit
 *
 * @param personLimits - The configured person limits from board property
 */
export const applyLimits = createAction({
  name: 'applyLimits',
  handler(personLimits: { limits: PersonLimitInput[] }): void {
    const pageObject = this.di.inject(personLimitsBoardPageObjectToken);
    const { actions } = useRuntimeStore.getState();
    const { cssSelectorOfIssues } = useRuntimeStore.getState().data;

    // Calculate stats
    const stats = calculateStats(personLimits);
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
