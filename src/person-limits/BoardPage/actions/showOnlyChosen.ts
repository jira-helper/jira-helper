import { createAction } from 'src/shared/action';
import { IPersonLimitsBoardPageObject, personLimitsBoardPageObjectToken } from '../pageObject';
import { useRuntimeStore } from '../stores';
import { isPersonLimitAppliedToIssue, isPersonsIssue } from '../utils';

/**
 * Hide empty swimlanes and parent groups after filtering.
 */
function showOrHideTaskAggregations(pageObject: IPersonLimitsBoardPageObject, cssSelectorOfIssues: string): void {
  // Hide/show parent groups (for subtasks)
  const parentGroups = pageObject.getParentGroups();
  parentGroups.forEach(group => {
    const { total, hidden } = pageObject.countIssueVisibility(group, cssSelectorOfIssues);
    const shouldShow = total === 0 || hidden < total;
    pageObject.setParentGroupVisibility(group, shouldShow);
  });

  // Hide/show swimlanes
  const swimlanes = pageObject.getSwimlanes();
  swimlanes.forEach(swimlane => {
    const { total, hidden } = pageObject.countIssueVisibility(swimlane, cssSelectorOfIssues);
    const shouldShow = total === 0 || hidden < total;
    pageObject.setSwimlaneVisibility(swimlane, shouldShow);
  });
}

/**
 * Show only issues matching the active person's limit filter.
 *
 * If no person is active (activeLimitId is null), shows all issues.
 * Otherwise, hides issues that don't match the active person's limit criteria.
 * Also hides empty swimlanes and parent groups.
 */
export const showOnlyChosen = createAction({
  name: 'showOnlyChosen',
  handler(): void {
    const pageObject = this.di.inject(personLimitsBoardPageObjectToken);
    const { stats, activeLimitId, cssSelectorOfIssues } = useRuntimeStore.getState().data;

    const issues = pageObject.getIssues(cssSelectorOfIssues);

    // If no active filter, show all issues
    if (activeLimitId == null) {
      issues.forEach(issue => {
        pageObject.setIssueVisibility(issue, true);
      });
      showOrHideTaskAggregations(pageObject, cssSelectorOfIssues);
      return;
    }

    // Find the active person's limit configuration
    const personLimit = stats.find(s => s.id === activeLimitId);
    if (!personLimit) return;

    // Show/hide issues based on the limit's showAllPersonIssues setting
    issues.forEach(issue => {
      const assignee = pageObject.getAssigneeFromIssue(issue);

      let shouldShow: boolean;
      if (personLimit.showAllPersonIssues) {
        shouldShow = isPersonsIssue(personLimit, assignee);
      } else {
        const columnId = pageObject.getColumnId(issue);
        const swimlaneId = pageObject.getSwimlaneId(issue);
        const issueType = pageObject.getIssueType(issue);
        shouldShow = isPersonLimitAppliedToIssue(personLimit, assignee, columnId!, swimlaneId, issueType);
      }

      pageObject.setIssueVisibility(issue, shouldShow);
    });

    showOrHideTaskAggregations(pageObject, cssSelectorOfIssues);
  },
});
