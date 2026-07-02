/* eslint-disable @typescript-eslint/no-unused-vars -- Cloud PageObject implements shared interface methods that are no-ops on Jira Cloud. */
// src/cloud/shared/BoardPagePageObject.ts
// Page Object для работы с доской Jira Cloud

import React from 'react';

import { createRoot, Root } from 'react-dom/client';
import type {
  IBoardPagePageObject as ServerBoardPagePageObject,
  IssueCountOptions,
} from 'src/infrastructure/page-objects/BoardPage';

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
    options?: { position: 'aftersummary' }
  ) {
    let div = this.card.querySelector(`[data-jh-attached-key="${key}"]`);

    if (div) {
      return;
    }

    div = document.createElement('div');
    div.setAttribute('data-jh-attached-key', key);
    if (options?.position === 'aftersummary') {
      this.card.querySelector('.ghx-issue-fields')?.after(div);
    } else {
      this.card.querySelector('.ghx-issue-content')?.appendChild(div);
    }

    const root = createRoot(div);
    root.render(<ComponentToAttach issueId={this.getIssueId()} />);

    this.unmountReactRootWhenCardIsRemoved(root);
  }

  private unmountReactRootWhenCardIsRemoved(root: Root) {
    const interval = setInterval(() => {
      if (!document.body.contains(this.card)) {
        root.unmount();
        clearInterval(interval);
      }
    }, 1000);
  }
}

type CloudSelectors = ServerBoardPagePageObject['selectors'] & {
  boardHeaderTarget: string;
  issueCardCloud: string;
  boardHeaderCloud: string;
  boardContainerCloud: string;
  boardColumnContainerCloud: string;
};

export interface IBoardPagePageObject extends Omit<ServerBoardPagePageObject, 'selectors' | 'listenCards'> {
  selectors: CloudSelectors;
  listenCards(callback: (cards: CardPageObject[]) => void): () => void;
  getAllCloudCards(): HTMLElement[];
  getBoardId(): number | null;
  getIssueCssSelector(editData: any): string;
  setCachedColumns(columns: Array<{ id: string; name: string }>): void;
}

type CloudBoardPagePageObjectInternal = IBoardPagePageObject & {
  _columnsCache: Array<{ id: string; name: string }> | null;
  _findColumnElement(columnId: string): Element | null;
  _findHeaderElementInColumn(column: HTMLElement): HTMLElement;
};

export const BoardPagePageObject: CloudBoardPagePageObjectInternal = {
  _columnsCache: null as Array<{ id: string; name: string }> | null,

  setCachedColumns(columns: Array<{ id: string; name: string }>) {
    this._columnsCache = columns;
  },

  selectors: {
    pool: '[data-testid^="software-board.board-container.board"]',
    issue: '[data-testid="platform-board-kit.ui.card.card"]',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '[data-testid="software-board.layout.sidebar"]',
    column: '[data-testid*="draggable-column"]',
    columnHeader: '[data-testid="software-board.header.controls-bar"]',
    columnTitle: '[data-testid="platform-board-kit.ui.column-header-content"]',
    daysInColumn: '.ghx-days',
    swimlaneHeader: '',
    swimlaneRow: '',
    avatarImg: '[data-testid="platform-board-kit.ui.avatar"]',
    issueType: '[data-testid="platform-board-kit.ui.type-badge"]',
    parentGroup: '',
    boardHeaderTarget: '[data-testid="software-board.header.controls-bar"]',
    issueCardCloud: '[data-testid="platform-board-kit.ui.card.card"]',
    boardHeaderCloud: '[data-testid="software-board.header.controls-bar"]',
    boardContainerCloud: '[data-testid^="software-board.board-container"]',
    boardColumnContainerCloud: '[data-testid^="software-board.board-container.board"]',
  },

  classlist: {
    flagged: 'ghx-flagged',
  },

  getColumns(): string[] {
    return Array.from(document.querySelectorAll(this.selectors.columnTitle) || []).map(
      column => column.textContent?.trim() || ''
    );
  },

  listenCards(callback: (cards: CardPageObject[]) => void) {
    let currentCards = '';
    const getCards = () => {
      const cards = Array.from(document.querySelectorAll(this.selectors.issue)).map(card => new CardPageObject(card));
      return cards;
    };
    const getCurrentCardsState = (cards: CardPageObject[]) => cards.map(card => card.getIssueId()).join(',');

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

  getDaysInColumn(_issueId: string): number | null {
    return null;
  },

  hideDaysInColumn(): void {
    document.querySelectorAll<HTMLElement>(this.selectors.daysInColumn).forEach(element => {
      element.style.display = 'none';
    });
  },

  getHtml(): string {
    return document.body.innerHTML;
  },

  getAllCloudCards(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(this.selectors.issueCardCloud));
  },

  getBoardId(): number | null {
    const urlMatch = window.location.pathname.match(/\/boards\/(\d+)/);
    if (urlMatch) {
      const id = parseInt(urlMatch[1], 10);
      return id;
    }

    const boardElement =
      document.querySelector('[data-board-id]') ||
      document.querySelector('[data-testid*="board"]:not([data-testid*="column"]):not([data-testid*="card"])');

    if (boardElement) {
      const idAttr = boardElement.getAttribute('data-board-id');
      if (idAttr) {
        return parseInt(idAttr, 10);
      }

      const testId = boardElement.getAttribute('data-testid');
      const boardIdMatch = testId?.match(/board[_-]?(\d+)/i);
      if (boardIdMatch) {
        return parseInt(boardIdMatch[1], 10);
      }
    }

    const metaBoard = document.querySelector('meta[name="ajs-board-id"]');
    if (metaBoard) {
      const id = parseInt(metaBoard.getAttribute('content') || '0', 10);
      if (id > 0) {
        return id;
      }
    }

    return null;
  },

  getIssueCssSelector(_editData: any): string {
    return this.selectors.issue;
  },

  getSwimlanes(): Array<{ id: string; element: Element; header: Element }> {
    return [];
  },

  getSwimlaneHeader(_swimlaneId: string): Element | null {
    return null;
  },

  getIssueCountInSwimlane(_swimlaneId: string, _options?: IssueCountOptions): number {
    return this.getAllCloudCards().length;
  },

  getIssueCountByColumn(_swimlaneId: string, options?: IssueCountOptions): number[] {
    return this.getOrderedColumnIds().map(columnId => this.getIssueCountInColumn(columnId, options));
  },

  getIssueCountForColumns(_swimlaneId: string, columns: string[], options?: IssueCountOptions): number {
    return columns.reduce((total, columnId) => total + this.getIssueCountInColumn(columnId, options), 0);
  },

  insertSwimlaneComponent(header: Element, component: React.ReactNode, key: string): void {
    let container = header.querySelector(`[data-jh-swimlane-component="${key}"]`);
    if (!container) {
      container = document.createElement('span');
      container.setAttribute('data-jh-swimlane-component', key);
      header.appendChild(container);
    }

    createRoot(container).render(<>{component}</>);
  },

  removeSwimlaneComponent(header: Element, key: string): void {
    header.querySelector(`[data-jh-swimlane-component="${key}"]`)?.remove();
  },

  highlightSwimlane(header: Element, exceeded: boolean): void {
    (header as HTMLElement).style.backgroundColor = exceeded ? '#ffebe6' : '';
  },

  hasCustomSwimlanes(): boolean {
    return false;
  },

  getColumnElements(): Element[] {
    return Array.from(document.querySelectorAll(this.selectors.column));
  },

  getColumnsInSwimlane(_swimlane: Element): Element[] {
    return [];
  },

  getColumnHeaderElement(columnId: string): HTMLElement | null {
    const column = this._findColumnElement(columnId);
    if (!column) {
      return null;
    }

    return this._findHeaderElementInColumn(column as HTMLElement);
  },

  getOrderedColumnIds(): string[] {
    if (this._columnsCache && this._columnsCache.length > 0) {
      const ids = this._columnsCache.map(c => c.id);
      return ids;
    }
    const columns = Array.from(
      document.querySelectorAll('[data-testid="platform-board-kit.ui.column.draggable-column"]')
    );
    return columns.map((_, i) => `column-${i}`);
  },

  getOrderedColumns(): Array<{ id: string; name: string }> {
    if (this._columnsCache && this._columnsCache.length > 0) {
      return this._columnsCache;
    }
    const columns = Array.from(document.querySelectorAll('[data-testid*="draggable-column"]'));
    return columns.map((col, index) => {
      const heading = col.querySelector('h2, h3, [title]');
      let name = heading?.getAttribute('title') || heading?.textContent?.replace(/\s*\d+\s*$/, '').trim() || '';
      if (!name) {
        const titleEl = col.querySelector(this.selectors.columnTitle);
        name = titleEl?.textContent?.trim() ?? '';
      }
      return { id: `column-${index}`, name: name || `Column ${index + 1}` };
    });
  },

  getSwimlaneIds(): string[] {
    return [];
  },

  _findColumnElement(columnId: string): Element | null {
    const match = columnId.match(/^column-(\d+)$/);
    if (match) {
      const columns = document.querySelectorAll('[data-testid*="draggable-column"]');
      return columns[parseInt(match[1], 10)] || null;
    }
    const selectors = [
      this.selectors.column,
      '[data-testid^="platform-board-kit.ui.column.draggable-column"]',
      '[data-testid^="platform-board-kit.ui.column.column-container"]',
    ];
    for (let s = 0; s < selectors.length; s++) {
      const sel = selectors[s];
      const columns = document.querySelectorAll(sel);
      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];
        if (col.getAttribute('data-column-id') === columnId || col.getAttribute('data-id') === columnId) {
          return col;
        }
      }
    }
    if (this._columnsCache) {
      const cached = this._columnsCache.find(c => c.id === columnId);
      if (cached) {
        for (let s = 0; s < selectors.length; s++) {
          const columns = document.querySelectorAll(selectors[s]);
          for (let c = 0; c < columns.length; c++) {
            const h2 = columns[c].querySelector('h2');
            if (h2 && h2.textContent && h2.textContent.trim().startsWith(cached.name)) {
              return columns[c];
            }
          }
        }
        const idx = this._columnsCache.indexOf(cached);
        for (let s = 0; s < selectors.length; s++) {
          const columns = document.querySelectorAll(selectors[s]);
          if (columns[idx]) {
            return columns[idx];
          }
        }
      }
    }
    return null;
  },

  _findHeaderElementInColumn(column: HTMLElement): HTMLElement {
    const header =
      column.querySelector<HTMLElement>('[data-testid*="column-header"]:not([data-testid*="content"])') ||
      column
        .querySelector<HTMLElement>(this.selectors.columnTitle)
        ?.closest<HTMLElement>('[data-testid*="column-header"]') ||
      column.querySelector<HTMLElement>(this.selectors.columnTitle) ||
      column.querySelector<HTMLElement>('h2, h3');

    return header ?? column;
  },

  getIssueCountInColumn(columnId: string, _options?: any): number {
    const col = this._findColumnElement(columnId);
    if (!col) {
      return 0;
    }
    const cards = col.querySelectorAll(this.selectors.issue);
    return cards.length;
  },

  styleColumnHeader(columnId: string, styles: Partial<CSSStyleDeclaration>): void {
    const el = this.getColumnHeaderElement(columnId);
    if (!el) {
      return;
    }
    Object.assign(el.style, styles);
  },

  resetColumnHeaderStyles(columnId: string): void {
    const el = this.getColumnHeaderElement(columnId);
    if (!el) {
      return;
    }
    const { style } = el;
    style.removeProperty('background-color');
    style.removeProperty('border-top');
    style.removeProperty('border-top-left-radius');
    style.removeProperty('border-top-right-radius');
    style.removeProperty('position');
  },

  insertColumnHeaderHtml(columnId: string, html: string): void {
    const el = this.getColumnHeaderElement(columnId);
    if (!el) {
      return;
    }
    el.insertAdjacentHTML('beforeend', html);
  },

  removeColumnHeaderElements(columnId: string, selector: string): void {
    const el = this.getColumnHeaderElement(columnId);
    if (!el) return;
    const elements = el.querySelectorAll(selector);
    elements.forEach(e => e.remove());
  },

  highlightColumnCells(columnId: string, color: string, _excludedSwimlaneIds?: string[]): void {
    const col = this._findColumnElement(columnId);
    if (col) {
      (col as HTMLElement).style.backgroundColor = color;
    }
  },

  resetColumnCellStyles(columnId: string): void {
    const col = this._findColumnElement(columnId);
    if (col) {
      (col as HTMLElement).style.backgroundColor = '';
    }
  },

  getIssueElements(cssSelector: string): Element[] {
    return Array.from(document.querySelectorAll(cssSelector));
  },

  getIssueElementsInColumn(column: Element, cssSelector: string): Element[] {
    return Array.from(column.querySelectorAll(cssSelector));
  },

  getAssigneeFromIssue(issue: Element): string | null {
    const hiddenElements = issue.querySelectorAll('[hidden], [aria-hidden="true"]');
    for (const element of Array.from(hiddenElements)) {
      const text = element.textContent?.trim();
      if (!text) continue;
      const match = text.match(/^(?:Исполнитель|Assignee):\s*(.+)$/i);
      if (match) return match[1].trim();
      if (text === 'Не назначено' || text === 'Unassigned') return 'Unassigned';
    }
    const assigneeButton = issue.querySelector('[aria-label*="Исполнитель"], [aria-label*="Assignee"]');
    if (assigneeButton) {
      const label = assigneeButton.getAttribute('aria-label') ?? '';
      const match = label.match(/^(?:Исполнитель|Assignee):\s*(.+)$/i);
      if (match) return match[1].trim();
    }
    const avatarImg = issue.querySelector('img[alt*="Исполнитель"], img[alt*="Assignee"]');
    if (avatarImg) {
      const alt = avatarImg.getAttribute('alt') ?? '';
      const match = alt.match(/^(?:Исполнитель|Assignee):\s*(.+)$/i);
      if (match) return match[1].trim();
    }
    return null;
  },

  getIssueTypeFromIssue(issue: Element): string | null {
    const typeEl = issue.querySelector(this.selectors.issueType) as HTMLElement | null;
    if (!typeEl) return null;
    return typeEl.getAttribute('title') ?? typeEl.textContent ?? null;
  },

  getColumnIdOfIssue(issue: Element): string | null {
    const columnEl = issue.closest('[data-testid*="draggable-column"]');
    if (!columnEl) return null;
    const columnElements = Array.from(document.querySelectorAll('[data-testid*="draggable-column"]'));
    const index = columnElements.indexOf(columnEl);
    return index >= 0 ? `column-${index}` : null;
  },

  getColumnIdFromColumn(column: Element): string | null {
    const columnElements = Array.from(document.querySelectorAll('[data-testid*="draggable-column"]'));
    const index = columnElements.indexOf(column);
    return index >= 0 ? `column-${index}` : null;
  },

  getSwimlaneIdOfIssue(_issue: Element): string | null {
    return null;
  },

  getParentGroups(): Element[] {
    return [];
  },

  countIssueVisibility(element: Element, cssSelector: string) {
    const total = element.querySelectorAll(cssSelector).length;
    const hidden = element.querySelectorAll(`${cssSelector}.no-visibility`).length;
    return { total, hidden };
  },

  setIssueBackgroundColor(issue: Element, color: string): void {
    const el = issue as HTMLElement;
    el.style.setProperty('background-color', color, 'important');
    const styled = el.querySelector('[style*="card-background"]') as HTMLElement | null;
    if (styled) {
      styled.style.setProperty('--card-background-color', color, 'important');
      styled.style.setProperty('--card-hover-background-color', color, 'important');
      styled.style.setProperty('--card-hover-text-color', '#fff', 'important');
      styled.style.setProperty('background-color', color, 'important');
    }
  },

  resetIssueBackgroundColor(issue: Element): void {
    const el = issue as HTMLElement;
    el.style.removeProperty('background-color');
    const styled = el.querySelector('[style*="card-background"]') as HTMLElement | null;
    if (styled) {
      styled.style.removeProperty('--card-background-color');
      styled.style.removeProperty('--card-hover-background-color');
      styled.style.removeProperty('--card-hover-text-color');
      styled.style.removeProperty('background-color');
    }
  },

  setIssueVisibility(issue: Element, visible: boolean): void {
    if (visible) {
      issue.classList.remove('no-visibility');
    } else {
      issue.classList.add('no-visibility');
    }
  },

  setSwimlaneVisibility(swimlane: Element, visible: boolean): void {
    if (visible) {
      swimlane.classList.remove('no-visibility');
    } else {
      swimlane.classList.add('no-visibility');
    }
  },

  setParentGroupVisibility(group: Element, visible: boolean): void {
    if (visible) {
      group.classList.remove('no-visibility');
    } else {
      group.classList.add('no-visibility');
    }
  },
};
