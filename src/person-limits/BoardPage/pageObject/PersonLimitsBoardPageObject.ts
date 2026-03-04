import { settingsJiraDOM as DOM } from '../../../swimlane/constants';
import type { IPersonLimitsBoardPageObject } from './IPersonLimitsBoardPageObject';

const NO_VISIBILITY_CLASS = 'no-visibility';

/**
 * Parses assignee name from tooltip string.
 * Format: "Assignee: Pavel [x]" -> "Pavel"
 * Handles names with brackets like "Иван [В]" correctly.
 * Only removes trailing " [x]" suffix (inactive user marker), preserves other brackets.
 */
export const getNameFromTooltip = (tooltip: string): string => {
  const parts = tooltip.split(':');
  const name = parts.length < 2 ? tooltip : parts.slice(1).join(':');
  return name.replace(/ \[x\]$/, '').trim();
};

/**
 * Production implementation of PersonLimits BoardPage DOM operations.
 */
export const PersonLimitsBoardPageObject: IPersonLimitsBoardPageObject = {
  selectors: {
    issue: '.ghx-issue',
    avatarImg: '.ghx-avatar-img',
    issueType: '.ghx-type',
    column: '.ghx-column',
    swimlane: DOM.swimlane,
    swimlaneHeader: DOM.swimlaneHeaderContainer,
    parentGroup: '.ghx-parent-group',
  },

  // === Queries ===

  getIssues(cssSelector: string): Element[] {
    return Array.from(document.querySelectorAll(cssSelector));
  },

  getAssigneeFromIssue(issue: Element): string | null {
    const avatar = issue.querySelector(this.selectors.avatarImg) as HTMLElement | null;
    if (!avatar) return null;

    const label = avatar.getAttribute('alt') ?? avatar.getAttribute('data-tooltip');
    if (!label) return null;

    return getNameFromTooltip(label);
  },

  getIssueType(issue: Element): string | null {
    const typeEl = issue.querySelector(this.selectors.issueType) as HTMLElement | null;
    if (!typeEl) return null;
    return typeEl.getAttribute('title') ?? typeEl.textContent ?? null;
  },

  getColumnId(issue: Element): string | null {
    const column = issue.closest(this.selectors.column) as HTMLElement | null;
    return column?.dataset.columnId ?? null;
  },

  getColumnIdFromColumn(column: Element): string | null {
    return (column as HTMLElement).dataset.columnId ?? null;
  },

  getSwimlaneId(issue: Element): string | null {
    const swimlane = issue.closest(this.selectors.swimlane) as HTMLElement | null;
    return swimlane?.getAttribute('swimlane-id') ?? null;
  },

  hasCustomSwimlanes(): boolean {
    const swimlaneHeader = document.querySelector(this.selectors.swimlaneHeader);
    if (!swimlaneHeader) return false;
    return swimlaneHeader.getAttribute('aria-label')?.includes('custom') ?? false;
  },

  getSwimlanes(): Element[] {
    return Array.from(document.querySelectorAll(this.selectors.swimlane));
  },

  getColumnsInSwimlane(swimlane: Element): Element[] {
    return Array.from(swimlane.querySelectorAll(this.selectors.column));
  },

  getColumns(): Element[] {
    return Array.from(document.querySelectorAll(this.selectors.column));
  },

  getParentGroups(): Element[] {
    return Array.from(document.querySelectorAll(this.selectors.parentGroup));
  },

  countIssueVisibility(element: Element, cssSelector: string) {
    const total = element.querySelectorAll(cssSelector).length;
    const hidden = element.querySelectorAll(`${cssSelector}.${NO_VISIBILITY_CLASS}`).length;
    return { total, hidden };
  },

  // === Commands ===

  setIssueBackgroundColor(issue: Element, color: string): void {
    (issue as HTMLElement).style.backgroundColor = color;
  },

  resetIssueBackgroundColor(issue: Element): void {
    (issue as HTMLElement).style.backgroundColor = '';
  },

  setIssueVisibility(issue: Element, visible: boolean): void {
    if (visible) {
      issue.classList.remove(NO_VISIBILITY_CLASS);
    } else {
      issue.classList.add(NO_VISIBILITY_CLASS);
    }
  },

  setSwimlaneVisibility(swimlane: Element, visible: boolean): void {
    if (visible) {
      swimlane.classList.remove(NO_VISIBILITY_CLASS);
    } else {
      swimlane.classList.add(NO_VISIBILITY_CLASS);
    }
  },

  setParentGroupVisibility(group: Element, visible: boolean): void {
    if (visible) {
      group.classList.remove(NO_VISIBILITY_CLASS);
    } else {
      group.classList.add(NO_VISIBILITY_CLASS);
    }
  },
};
