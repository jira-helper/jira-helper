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

/**
 * Identifies the active selection on the board.
 * - `personName: null` → entire limit (used when the limit is sharedLimit=true,
 *   or when nothing more granular than the limit is needed).
 * - `personName: string` → highlight only the given person inside the limit
 *   (per-person, sharedLimit=false).
 */
export type ActivePerson = {
  limitId: number;
  personName: string | null;
};

export class BoardRuntimeModel {
  stats: PersonLimitStats[] = [];

  /**
   * Currently highlighted selection. `null` means nothing is highlighted and
   * all issues are visible.
   */
  activePerson: ActivePerson | null = null;

  cssSelectorOfIssues: string = '.ghx-issue';

  /**
   * Whether the board's swimlane strategy is "custom" (Queries).
   * When false, saved swimlane filters in person limits are inert
   * (Jira's editmodel keeps query definitions across strategy switches),
   * so we must ignore them during matching to avoid silently filtering everything out.
   */
  private swimlanesActive: boolean = true;

  constructor(
    private propertyModel: PropertyModel,
    private pageObject: IBoardPagePageObject,
    private logger: Logger
  ) {}

  /**
   * Backward-compatible accessor: returns just the limitId of the active selection.
   * Setter accepts a numeric id (treated as "whole limit", personName=null) or null.
   * Kept for legacy call sites and tests; new code should prefer `activePerson`.
   */
  get activeLimitId(): number | null {
    return this.activePerson?.limitId ?? null;
  }

  set activeLimitId(value: number | null) {
    this.activePerson = value == null ? null : { limitId: value, personName: null };
  }

  /** Strip saved swimlane filter when board strategy isn't "custom". */
  private effectiveLimit(personLimit: PersonLimitStats): PersonLimitStats {
    if (this.swimlanesActive) return personLimit;
    return { ...personLimit, swimlanes: [] };
  }

  /**
   * Count one column's issues into the running stats.
   *
   * The swimlane id is derived per-issue via `getSwimlaneIdOfIssue` rather than
   * passed in from the caller. That deliberately avoids relying on
   * `pageObject.getSwimlanes()` / `hasCustomSwimlanes()` — both require a
   * `.ghx-swimlane-header` element that Jira does NOT render for the default
   * swimlane (e.g. "Everything Else"). When a board has only the default
   * swimlane visible, the header-based discovery returns nothing and previously
   * caused every issue to be filtered out by saved swimlane filters.
   *
   * Reading the id straight off `.ghx-swimlane[swimlane-id]` (the wrapper that
   * IS always present when swimlanes are active) keeps the saved swimlane
   * filter semantics intact while supporting both cases.
   */
  private countIssuesInColumn(column: Element, stats: PersonLimitStats[]): void {
    const columnId = this.pageObject.getColumnIdFromColumn(column);
    if (!columnId) return;

    const issues = this.pageObject.getIssueElementsInColumn(column, this.cssSelectorOfIssues);
    issues.forEach(issue => {
      const assignee = this.pageObject.getAssigneeFromIssue(issue);
      const issueType = this.pageObject.getIssueTypeFromIssue(issue);
      const swimlaneId = this.pageObject.getSwimlaneIdOfIssue(issue);

      if (assignee) {
        stats.forEach(personLimit => {
          if (
            isPersonLimitAppliedToIssue(this.effectiveLimit(personLimit), assignee, columnId, swimlaneId, issueType)
          ) {
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
      id: computeLimitId(limit),
      persons: limit.persons.map(p => ({ name: p.name, displayName: p.displayName })),
      limit: limit.limit,
      issues: ref([]) as unknown as Element[],
      columns: limit.columns,
      swimlanes: limit.swimlanes,
      includedIssueTypes: limit.includedIssueTypes,
      showAllPersonIssues: limit.showAllPersonIssues,
      sharedLimit: limit.sharedLimit ?? false,
    }));

    const columns = this.pageObject.getColumnElements();
    columns.forEach(column => this.countIssuesInColumn(column, stats));

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
   * Show only issues matching the active selection, or all if none selected.
   *
   * Selection semantics:
   * - `activePerson.personName == null` → behave as before (whole limit).
   * - `activePerson.personName != null` → additionally restrict to that single
   *   assignee (used for per-person limits with sharedLimit=false).
   */
  showOnlyChosen(): void {
    const issues = this.pageObject.getIssueElements(this.cssSelectorOfIssues);

    if (this.activePerson == null) {
      issues.forEach(issue => this.pageObject.setIssueVisibility(issue, true));
      this.showOrHideTaskAggregations();
      return;
    }

    const personLimit = this.stats.find(s => s.id === this.activePerson!.limitId);
    if (!personLimit) return;

    const targetPerson = this.activePerson.personName;

    issues.forEach(issue => {
      const assignee = this.pageObject.getAssigneeFromIssue(issue);
      let shouldShow: boolean;
      if (personLimit.showAllPersonIssues) {
        shouldShow = isPersonsIssue(personLimit, assignee);
      } else {
        const columnId = this.pageObject.getColumnIdOfIssue(issue) ?? '';
        const swimlaneId = this.pageObject.getSwimlaneIdOfIssue(issue);
        const issueType = this.pageObject.getIssueTypeFromIssue(issue);
        shouldShow = isPersonLimitAppliedToIssue(
          this.effectiveLimit(personLimit),
          assignee,
          columnId,
          swimlaneId,
          issueType
        );
      }
      // Per-person narrowing: when a specific person inside the limit is targeted,
      // additionally require the issue's assignee to equal that person.
      if (shouldShow && targetPerson != null && assignee !== targetPerson) {
        // Allow legacy displayName-based assignees too.
        const matchByDisplay = personLimit.persons.find(p => p.name === targetPerson);
        if (!(matchByDisplay && matchByDisplay.displayName === assignee)) {
          shouldShow = false;
        }
      }
      this.pageObject.setIssueVisibility(issue, shouldShow);
    });

    this.showOrHideTaskAggregations();
  }

  /**
   * Returns the issues from `personLimit.issues` matching the given assignee.
   * Used by the apply() per-person overflow check.
   */
  private filterIssuesByPerson(personLimit: PersonLimitStats, personName: string): Element[] {
    const personEntry = personLimit.persons.find(p => p.name === personName);
    return personLimit.issues.filter(issue => {
      const assignee = this.pageObject.getAssigneeFromIssue(issue);
      return assignee === personName || (personEntry?.displayName != null && assignee === personEntry.displayName);
    });
  }

  /**
   * Recalculate stats, then highlight issues that exceed their limit.
   *
   * Overflow detection:
   * - sharedLimit=true → compare the total bucket against the limit (legacy behavior).
   * - sharedLimit=false → compare each person's own count; only the offending
   *   person's issues are highlighted, leaving teammates inside the same limit
   *   untouched.
   */
  apply(): void {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.apply');
    this.calculateStats();
    const allIssues = this.pageObject.getIssueElements(this.cssSelectorOfIssues);
    allIssues.forEach(issue => this.pageObject.resetIssueBackgroundColor(issue));
    this.stats.forEach(personLimit => {
      if (personLimit.sharedLimit || personLimit.persons.length <= 1) {
        if (personLimit.issues.length > personLimit.limit) {
          personLimit.issues.forEach(issue => {
            this.pageObject.setIssueBackgroundColor(issue, OVER_LIMIT_BG);
          });
        }
        return;
      }
      personLimit.persons.forEach(person => {
        const issuesForPerson = this.filterIssuesByPerson(personLimit, person.name);
        if (issuesForPerson.length > personLimit.limit) {
          issuesForPerson.forEach(issue => {
            this.pageObject.setIssueBackgroundColor(issue, OVER_LIMIT_BG);
          });
        }
      });
    });
    log(`Applied (${this.stats.length} limits)`);
  }

  /**
   * Toggle highlighting for an entire limit (legacy entry point — used by tests
   * and by avatars in shared-limit mode). Equivalent to `toggleActivePerson(id, null)`.
   */
  toggleActiveLimitId(id: number): void {
    this.toggleActivePerson(id, null);
  }

  /**
   * Toggle highlighting for a specific selection. Re-clicking the same selection
   * clears it.
   */
  toggleActivePerson(limitId: number, personName: string | null): void {
    const same = this.activePerson?.limitId === limitId && this.activePerson?.personName === personName;
    this.activePerson = same ? null : { limitId, personName };
    this.showOnlyChosen();
  }

  setCssSelectorOfIssues(selector: string): void {
    this.cssSelectorOfIssues = selector;
  }

  setSwimlanesActive(active: boolean): void {
    this.swimlanesActive = active;
  }

  reset(): void {
    this.stats = [];
    this.activePerson = null;
    this.cssSelectorOfIssues = '.ghx-issue';
    this.swimlanesActive = true;
  }
}
