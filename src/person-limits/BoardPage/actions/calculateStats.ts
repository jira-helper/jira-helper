import { createAction } from 'src/shared/action';
import type { IPersonLimitsBoardPageObject } from '../pageObject';
import { personLimitsBoardPageObjectToken } from '../pageObject';
import { useRuntimeStore, type PersonLimitStats } from '../stores';
import { isPersonLimitAppliedToIssue, computeLimitId } from '../utils';

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
 * Count issues for each person limit within a column.
 */
const countIssuesInColumn = (
  column: Element,
  stats: PersonLimitStats[],
  pageObject: IPersonLimitsBoardPageObject,
  cssSelector: string,
  swimlaneId?: string | null
): void => {
  const columnId = pageObject.getColumnIdFromColumn(column);
  if (!columnId) return;

  const issues = column.querySelectorAll(cssSelector);
  issues.forEach(issue => {
    const assignee = pageObject.getAssigneeFromIssue(issue);
    const issueType = pageObject.getIssueType(issue);

    if (assignee) {
      stats.forEach(personLimit => {
        if (isPersonLimitAppliedToIssue(personLimit, assignee, columnId, swimlaneId, issueType)) {
          personLimit.issues.push(issue);
        }
      });
    }
  });
};

/**
 * Calculate statistics for all person limits.
 * Collects issues matching each person's limit criteria.
 */
export const calculateStats = createAction({
  name: 'calculateStats',
  handler(personLimits: { limits: PersonLimitInput[] }): PersonLimitStats[] {
    const pageObject = this.di.inject(personLimitsBoardPageObjectToken);
    const { cssSelectorOfIssues } = useRuntimeStore.getState().data;

    // Initialize stats with empty issues arrays
    const stats: PersonLimitStats[] = personLimits.limits.map(limit => ({
      ...limit,
      id: computeLimitId(limit), // Всегда вычисляем id из параметров для стабильности
      issues: [] as Element[],
    }));

    if (pageObject.hasCustomSwimlanes()) {
      // With custom swimlanes: iterate through swimlanes first
      const swimlanes = pageObject.getSwimlanes();
      swimlanes.forEach(swimlane => {
        const swimlaneId = swimlane.getAttribute('swimlane-id');
        const columns = pageObject.getColumnsInSwimlane(swimlane);
        columns.forEach(column => {
          countIssuesInColumn(column, stats, pageObject, cssSelectorOfIssues, swimlaneId);
        });
      });
    } else {
      // Without custom swimlanes: iterate through columns directly
      const columns = pageObject.getColumns();
      columns.forEach(column => {
        countIssuesInColumn(column, stats, pageObject, cssSelectorOfIssues);
      });
    }

    return stats;
  },
});
