/**
 * @module BoardRuntimeModel
 *
 * Runtime stats and board highlighting / filtering for person WIP limits.
 * DOM only via IBoardPagePageObject; limits from PropertyModel (DI).
 */
import { ref } from 'valtio';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';
import type { PersonLimitStats } from './types';
import { isPersonLimitAppliedToIssue, isPersonsIssue, computeLimitId } from '../utils';

const OVER_LIMIT_BG = '#ff5630';

export class BoardRuntimeModel {
  stats: PersonLimitStats[] = [];

  activeLimitId: number | null = null;

  cssSelectorOfIssues: string = '.ghx-issue';

  constructor(
    private propertyModel: PropertyModel,
    private pageObject: IBoardPagePageObject,
    private logger: Logger
  ) {}

  private countIssuesInColumn(column: Element, stats: PersonLimitStats[], swimlaneId?: string | null): void {
    const columnId = this.pageObject.getColumnIdFromColumn(column);
    if (!columnId) return;

    const issues = this.pageObject.getIssueElementsInColumn(column, this.cssSelectorOfIssues);
    issues.forEach(issue => {
      const assignee = this.pageObject.getAssigneeFromIssue(issue);
      const issueType = this.pageObject.getIssueTypeFromIssue(issue);

      if (assignee) {
        stats.forEach(personLimit => {
          if (isPersonLimitAppliedToIssue(personLimit, assignee, columnId, swimlaneId, issueType)) {
            personLimit.issues.push(issue);
          }
        });
      }
    });
  }

  /**
   * Count issues for each person limit on the board.
   */
  calculateStats(): PersonLimitStats[] {
    const { limits } = this.propertyModel.data;
    const stats: PersonLimitStats[] = limits.map(limit => ({
      ...limit,
      id: computeLimitId(limit),
      /** ref: keep DOM nodes out of valtio proxy (native methods must stay bound). */
      issues: ref([] as Element[]) as unknown as Element[],
    }));

    if (this.pageObject.hasCustomSwimlanes()) {
      const swimlanes = this.pageObject.getSwimlanes();
      swimlanes.forEach(sw => {
        const columns = this.pageObject.getColumnsInSwimlane(sw.element);
        columns.forEach(column => this.countIssuesInColumn(column, stats, sw.id));
      });
    } else {
      const columns = this.pageObject.getColumnElements();
      columns.forEach(column => this.countIssuesInColumn(column, stats));
    }

    this.stats = stats;
    return stats;
  }

  private showOrHideTaskAggregations(): void {
    const { cssSelectorOfIssues } = this;
    const parentGroups = this.pageObject.getParentGroups();
    parentGroups.forEach(group => {
      const { total, hidden } = this.pageObject.countIssueVisibility(group, cssSelectorOfIssues);
      const shouldShow = total === 0 || hidden < total;
      this.pageObject.setParentGroupVisibility(group, shouldShow);
    });

    const swimlanes = this.pageObject.getSwimlanes();
    swimlanes.forEach(sw => {
      const { total, hidden } = this.pageObject.countIssueVisibility(sw.element, cssSelectorOfIssues);
      const shouldShow = total === 0 || hidden < total;
      this.pageObject.setSwimlaneVisibility(sw.element, shouldShow);
    });
  }

  /**
   * Show only issues matching the active person's limit filter, or all if none selected.
   */
  showOnlyChosen(): void {
    const issues = this.pageObject.getIssueElements(this.cssSelectorOfIssues);

    if (this.activeLimitId == null) {
      issues.forEach(issue => this.pageObject.setIssueVisibility(issue, true));
      this.showOrHideTaskAggregations();
      return;
    }

    const personLimit = this.stats.find(s => s.id === this.activeLimitId);
    if (!personLimit) return;

    issues.forEach(issue => {
      const assignee = this.pageObject.getAssigneeFromIssue(issue);
      let shouldShow: boolean;
      if (personLimit.showAllPersonIssues) {
        shouldShow = isPersonsIssue(personLimit, assignee);
      } else {
        const columnId = this.pageObject.getColumnIdOfIssue(issue) ?? '';
        const swimlaneId = this.pageObject.getSwimlaneIdOfIssue(issue);
        const issueType = this.pageObject.getIssueTypeFromIssue(issue);
        shouldShow = isPersonLimitAppliedToIssue(personLimit, assignee, columnId, swimlaneId, issueType);
      }
      this.pageObject.setIssueVisibility(issue, shouldShow);
    });

    this.showOrHideTaskAggregations();
  }

  /**
   * Recalculate stats, then highlight issues that exceed their limit.
   */
  apply(): void {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.apply');
    this.calculateStats();
    const allIssues = this.pageObject.getIssueElements(this.cssSelectorOfIssues);
    allIssues.forEach(issue => this.pageObject.resetIssueBackgroundColor(issue));
    this.stats.forEach(personLimit => {
      if (personLimit.issues.length > personLimit.limit) {
        personLimit.issues.forEach(issue => {
          this.pageObject.setIssueBackgroundColor(issue, OVER_LIMIT_BG);
        });
      }
    });
    log(`Applied (${this.stats.length} limits)`);
  }

  toggleActiveLimitId(id: number): void {
    if (this.activeLimitId === id) {
      this.activeLimitId = null;
    } else {
      this.activeLimitId = id;
    }
    this.showOnlyChosen();
  }

  setCssSelectorOfIssues(selector: string): void {
    this.cssSelectorOfIssues = selector;
  }

  reset(): void {
    this.stats = [];
    this.activeLimitId = null;
    this.cssSelectorOfIssues = '.ghx-issue';
  }
}
