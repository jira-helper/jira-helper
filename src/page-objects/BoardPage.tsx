import { Container, Token } from 'dioma';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

/**
 * Swimlane DOM element with id, row element and header container.
 */
export interface SwimlaneElement {
  id: string;
  element: Element;
  header: Element;
}

export interface IssueCountOptions {
  excludeDone?: boolean;
  excludeSubtasks?: boolean;
  includedIssueTypes?: string[];
}

const swimlaneRootsStore = new WeakMap<Element, Map<string, Root>>();

type BoardSelectors = Pick<
  IBoardPagePageObject['selectors'],
  'pool' | 'swimlaneRow' | 'swimlaneHeader' | 'issue' | 'column' | 'columnHeader' | 'columnTitle'
>;

function getSwimlaneColumns(swimlane: Element): Element[] {
  const columnsContainer = swimlane.querySelector('.ghx-columns');
  if (columnsContainer) {
    return Array.from(columnsContainer.children).filter(el => el.classList.contains('ghx-column'));
  }
  return Array.from(swimlane.querySelectorAll(':scope > .ghx-column'));
}

function getColumnTitleToIdMap(selectors: BoardSelectors): Map<string, string> {
  const header = document.querySelector(selectors.columnHeader);
  const titleElements = header?.querySelectorAll(selectors.columnTitle);
  if (!titleElements) return new Map();
  const map = new Map<string, string>();
  titleElements.forEach(titleEl => {
    const column = titleEl.closest(selectors.column);
    const id = column?.getAttribute('data-id') || column?.getAttribute('data-column-id');
    const title = titleEl.textContent?.trim();
    if (id && title) map.set(title, id);
  });
  return map;
}

function getIssueTypeFromCard(card: Element): string | null {
  const typeElement = card.querySelector('.ghx-type');
  if (!typeElement) return null;
  const title = typeElement.getAttribute('title');
  if (!title) return null;
  const typeName = title.includes(':') ? title.split(':')[1].trim() : title.trim();
  return typeName || null;
}

function countIssuesInColumn(column: Element, issueSelector: string, options?: IssueCountOptions): number {
  const issues = column.querySelectorAll(issueSelector);
  if (!options?.excludeDone && !options?.excludeSubtasks && !options?.includedIssueTypes?.length) {
    return issues.length;
  }
  return Array.from(issues).filter(issue => {
    if (options?.excludeDone && issue.classList.contains('ghx-done')) return false;
    if (options?.excludeSubtasks && issue.classList.contains('ghx-issue-subtask')) return false;
    if (options?.includedIssueTypes?.length) {
      const issueType = getIssueTypeFromCard(issue);
      if (!issueType || !options.includedIssueTypes.includes(issueType)) return false;
    }
    return true;
  }).length;
}

class CardPageObject {
  selectors = {
    issueKey: '.ghx-key',
  };

  constructor(private readonly card: Element) {}

  getIssueId() {
    return this.card.querySelector(this.selectors.issueKey)?.textContent?.trim() as string;
  }

  getCardElement() {
    return this.card;
  }

  attach(
    ComponentToAttach: React.ComponentType<{ issueId: string }>,
    key: string,
    options?: { position: 'aftersummary' | 'beforeend' | 'inFooterBeforeDays' }
  ) {
    let div = this.card.querySelector(`[data-jh-attached-key="${key}"]`);

    if (div) {
      return;
    }

    div = document.createElement('span');
    div.setAttribute('data-jh-attached-key', key);
    if (options?.position === 'aftersummary') {
      // ghx-summary is inside ghx-issue-fields and ghx-issue-fields width is not 100%
      this.card.querySelector('.ghx-issue-fields')?.after(div);
    } else if (options?.position === 'inFooterBeforeDays') {
      // Insert in .ghx-card-footer before .ghx-days if exists
      const footer = this.card.querySelector('.ghx-card-footer');
      const daysElement = footer?.querySelector('.ghx-days');
      if (footer && daysElement) {
        daysElement.before(div);
      } else if (footer) {
        footer.appendChild(div);
      } else {
        // Fallback: insert at the end of card content
        this.card.querySelector('.ghx-issue-content')?.appendChild(div);
      }
    } else if (options?.position === 'beforeend') {
      // Insert at the very end of card content
      this.card.querySelector('.ghx-issue-content')?.appendChild(div);
    } else {
      this.card.querySelector('.ghx-issue-content')?.appendChild(div);
    }

    const root = createRoot(div);
    root.render(<ComponentToAttach issueId={this.getIssueId()} />);

    this.unmountReactRootWhenCardIsRemoved(root);
  }

  /**
   * Jira can remove card from DOM by different ways, so we need to unmount React root when card is removed
   */
  private unmountReactRootWhenCardIsRemoved(root: Root) {
    const interval = setInterval(() => {
      if (!document.body.contains(this.card)) {
        root.unmount();
        clearInterval(interval);
      }
    }, 1000);
  }
}

export interface IBoardPagePageObject {
  selectors: {
    pool: string;
    issue: string;
    flagged: string;
    grabber: string;
    grabberTransparent: string;
    sidebar: string;
    column: string;
    columnHeader: string;
    columnTitle: string;
    daysInColumn: string;
    swimlaneHeader: string;
    swimlaneRow: string;
  };

  classlist: {
    flagged: string;
  };

  getColumns(): string[];
  listenCards(callback: (cards: CardPageObject[]) => void): () => void;
  getColumnOfIssue(issueId: string): string;
  getDaysInColumn(issueId: string): number | null;
  hideDaysInColumn(): void;
  getHtml(): string;
  getSwimlanes(): SwimlaneElement[];
  getSwimlaneHeader(swimlaneId: string): Element | null;
  getIssueCountInSwimlane(swimlaneId: string, options?: IssueCountOptions): number;
  getIssueCountByColumn(swimlaneId: string, options?: IssueCountOptions): number[];
  getIssueCountForColumns(swimlaneId: string, columns: string[], options?: IssueCountOptions): number;
  insertSwimlaneComponent(header: Element, component: React.ReactNode, key: string): void;
  removeSwimlaneComponent(header: Element, key: string): void;
  highlightSwimlane(header: Element, exceeded: boolean): void;
}

export const BoardPagePageObject: IBoardPagePageObject = {
  selectors: {
    pool: '#ghx-pool',
    issue: '.ghx-issue',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '.aui-sidebar.projects-sidebar .aui-navgroup.aui-navgroup-vertical',
    column: '.ghx-column',
    columnHeader: '#ghx-column-headers',
    columnTitle: '.ghx-column-title',
    daysInColumn: '.ghx-days',
    swimlaneHeader: '.ghx-swimlane-header',
    swimlaneRow: '.ghx-swimlane',
  },

  classlist: {
    flagged: 'ghx-flagged',
  },

  getColumns(): string[] {
    return Array.from(document.querySelectorAll('.ghx-column-title, #ghx-column-headers .ghx-column h2')).map(
      el => el.textContent?.trim() || ''
    );
  },

  listenCards(callback: (cards: CardPageObject[]) => void) {
    // Map to track the last known DOM element for each issueId
    // This allows us to detect when a card DOM element is recreated even if the issueId stays the same
    const cardElementsMap = new Map<string, Element>();
    let currentCards = '';
    const getCards = () => {
      const cards = Array.from(document.querySelectorAll(this.selectors.issue)).map(card => new CardPageObject(card));
      return cards;
    };
    const getCurrentCardsState = (cards: CardPageObject[]) => {
      const state: string[] = [];
      const currentIssueIds = new Set<string>();

      for (const card of cards) {
        const issueId = card.getIssueId();
        currentIssueIds.add(issueId);
        const cardElement = card.getCardElement();
        const lastKnownElement = cardElementsMap.get(issueId);

        // If the DOM element changed (but issueId is the same), the card was recreated
        if (lastKnownElement && lastKnownElement !== cardElement) {
          // Card was recreated - update the map and mark as changed
          cardElementsMap.set(issueId, cardElement);
          state.push(`${issueId}:recreated`);
        } else if (!lastKnownElement) {
          // New card - add to map
          cardElementsMap.set(issueId, cardElement);
          state.push(`${issueId}:new`);
        } else {
          // Same card, same element
          state.push(`${issueId}:same`);
        }
      }

      // Clean up removed cards from the map
      for (const [issueId] of cardElementsMap) {
        if (!currentIssueIds.has(issueId)) {
          cardElementsMap.delete(issueId);
        }
      }

      return state.join(',');
    };

    const notifyIfNewCards = () => {
      const cards = getCards();
      const currentCardsState = getCurrentCardsState(cards);
      if (currentCardsState !== currentCards) {
        currentCards = currentCardsState;
        callback(cards);
      }
    };

    notifyIfNewCards();

    const interval = setInterval(() => {
      notifyIfNewCards();
    }, 1000);

    return () => clearInterval(interval);
  },

  getColumnOfIssue(issueId: string) {
    const issue = document.querySelector(`[data-issue-key="${issueId}"]`);
    const columnId = issue?.closest(this.selectors.column)?.getAttribute('data-column-id');
    if (!columnId) return '';

    const column = document.querySelector(this.selectors.columnHeader)?.querySelector(`[data-id="${columnId}"]`);
    return column?.querySelector(this.selectors.columnTitle)?.textContent?.trim() || '';
  },

  getDaysInColumn(issueId: string): number | null {
    const issue = document.querySelector(`[data-issue-key="${issueId}"]`);
    if (!issue) return null;

    const daysElement = issue.querySelector(this.selectors.daysInColumn);
    if (!daysElement) return null;

    // Try to get from data-tooltip attribute first
    const tooltip = daysElement.getAttribute('data-tooltip') || daysElement.getAttribute('title') || '';
    // Format: "X day(s) in this column"
    const match = tooltip.match(/(\d+)\s*day/i);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Fallback: count the number of dot elements (each dot = 1 day)
    const dots = daysElement.querySelectorAll('.ghx-days-icon');
    if (dots.length > 0) {
      return dots.length;
    }

    // Last resort: try to parse text content
    const text = daysElement.textContent?.trim() || '';
    const textMatch = text.match(/(\d+)/);
    if (textMatch) {
      return parseInt(textMatch[1], 10);
    }

    return null;
  },

  hideDaysInColumn(): void {
    // Add CSS rule to hide default Jira days counter
    const styleId = 'jira-helper-hide-days-in-column';
    if (document.getElementById(styleId)) {
      return; // Already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ghx-issue .ghx-days {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  },

  getHtml(): string {
    return document.body.innerHTML;
  },

  getSwimlanes(): SwimlaneElement[] {
    const pool = document.querySelector(this.selectors.pool);
    const swimlanes = pool
      ? pool.querySelectorAll(this.selectors.swimlaneRow)
      : document.querySelectorAll(this.selectors.swimlaneRow);
    return Array.from(swimlanes)
      .map(swimlane => {
        const id = swimlane.getAttribute('swimlane-id');
        const header = swimlane.querySelector(this.selectors.swimlaneHeader);
        if (!id || !header) return null;
        return { id, element: swimlane, header };
      })
      .filter((s): s is SwimlaneElement => s !== null);
  },

  getSwimlaneHeader(swimlaneId: string): Element | null {
    const swimlane = document.querySelector(`${this.selectors.swimlaneRow}[swimlane-id="${swimlaneId}"]`);
    return swimlane?.querySelector(this.selectors.swimlaneHeader) ?? null;
  },

  getIssueCountInSwimlane(swimlaneId: string, options?: IssueCountOptions): number {
    const swimlane = document.querySelector(`${this.selectors.swimlaneRow}[swimlane-id="${swimlaneId}"]`);
    if (!swimlane) return 0;
    const columns = getSwimlaneColumns(swimlane);
    return columns.reduce(
      (acc: number, column: Element) => acc + countIssuesInColumn(column, this.selectors.issue, options),
      0
    );
  },

  getIssueCountByColumn(swimlaneId: string, options?: IssueCountOptions): number[] {
    const swimlane = document.querySelector(`${this.selectors.swimlaneRow}[swimlane-id="${swimlaneId}"]`);
    if (!swimlane) return [];
    const columnsContainer = swimlane.querySelector('.ghx-columns');
    if (!columnsContainer) return [];
    const counts: number[] = [];
    columnsContainer.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const column = node as HTMLElement;
        counts.push(countIssuesInColumn(column, this.selectors.issue, options));
      }
    });
    return counts;
  },

  getIssueCountForColumns(swimlaneId: string, columns: string[], options?: IssueCountOptions): number {
    const swimlane = document.querySelector(`${this.selectors.swimlaneRow}[swimlane-id="${swimlaneId}"]`);
    if (!swimlane) return 0;
    const columnTitleToId = getColumnTitleToIdMap(this.selectors);
    const swimlaneColumns = getSwimlaneColumns(swimlane);
    return columns.reduce((acc: number, columnTitle: string) => {
      const columnId = columnTitleToId.get(columnTitle);
      if (!columnId) return acc;
      const column = swimlaneColumns.find((col: Element) => col.getAttribute('data-column-id') === columnId);
      if (!column) return acc;
      return acc + countIssuesInColumn(column, this.selectors.issue, options);
    }, 0);
  },

  insertSwimlaneComponent(header: Element, component: React.ReactNode, key: string): void {
    let container = header.querySelector(`[data-jh-attached-key="${key}"]`);
    if (container) return;

    // Make header a flex container so histogram appears inline with title
    (header as HTMLElement).style.display = 'flex';

    container = document.createElement('span');
    container.setAttribute('data-jh-attached-key', key);
    header.insertAdjacentElement('afterbegin', container);

    const root = createRoot(container);
    root.render(component);

    let rootsByKey = swimlaneRootsStore.get(header);
    if (!rootsByKey) {
      rootsByKey = new Map<string, Root>();
      swimlaneRootsStore.set(header, rootsByKey);
    }
    rootsByKey.set(key, root);
  },

  removeSwimlaneComponent(header: Element, key: string): void {
    const container = header.querySelector(`[data-jh-attached-key="${key}"]`);
    if (!container) return;

    const rootsByKey = swimlaneRootsStore.get(header);
    if (rootsByKey) {
      const root = rootsByKey.get(key);
      if (root) {
        root.unmount();
        rootsByKey.delete(key);
      }
    }
    container.remove();
  },

  highlightSwimlane(header: Element, exceeded: boolean): void {
    const swimlane = header.closest(this.selectors.swimlaneRow) as HTMLElement;
    const swimlaneDescription = swimlane?.querySelector('.ghx-description') as HTMLElement | null;
    const innerHeader = header as HTMLElement;

    const bgColor = exceeded ? 'rgb(255, 86, 48)' : '';
    const textColor = exceeded ? 'rgb(255, 215, 0)' : '';

    if (swimlane) swimlane.style.backgroundColor = bgColor;
    if (swimlaneDescription) swimlaneDescription.style.color = textColor;
    if (innerHeader) innerHeader.style.backgroundColor = bgColor;
  },
};

export const boardPagePageObjectToken = new Token<IBoardPagePageObject>('boardPagePageObjectToken');

export const registerBoardPagePageObjectInDI = (container: Container) => {
  container.register({ token: boardPagePageObjectToken, value: BoardPagePageObject });
};
