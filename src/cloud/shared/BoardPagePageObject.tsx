// src/cloud/shared/BoardPagePageObject.ts
// Page Object для работы с доской Jira Cloud

import React from 'react';

import { createRoot, Root } from 'react-dom/client';

class CardPageObject {
  selectors = {
    issueKey: '.ghx-key',
  };

  constructor(private readonly card: Element) {}

  getIssueId() {
    return this.card.querySelector(this.selectors.issueKey)?.textContent?.trim() as string;
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
    avatarImg: string;
    issueType: string;
    parentGroup: string;
    boardHeaderTarget: string;
    issueCardCloud: string;
    boardHeaderCloud: string;
    boardContainerCloud: string;
    boardColumnContainerCloud: string;
  };

  classlist: {
    flagged: string;
  };

  getSwimlaneIds(): string[];
  getColumns(): string[];
  listenCards(callback: (cards: CardPageObject[]) => void): () => void;
  getColumnOfIssue(issueId: string): string;
  getHtml(): string;
  getAllCloudCards(): HTMLElement[];
  getBoardId(): number | null;
  getIssueCssSelector(editData: any): string;
  getSwimlanes(): Array<{ id: string; element: Element; header: Element }>;
  hasCustomSwimlanes(): boolean;
  getColumnElements(): Element[];
  getColumnsInSwimlane(swimlane: Element): Element[];
  setCachedColumns(columns: Array<{ id: string; name: string }>): void;
  getOrderedColumnIds(): string[];
  getOrderedColumns(): Array<{ id: string; name: string }>;
  getColumnHeaderElement(columnId: string): HTMLElement | null;
  getIssueCountInColumn(columnId: string, options?: any): number;
  styleColumnHeader(columnId: string, styles: Partial<CSSStyleDeclaration>): void;
  resetColumnHeaderStyles(columnId: string): void;
  insertColumnHeaderHtml(columnId: string, html: string): void;
  insertBeforeColumn(columnId: string, html: string): void;
  removeColumnHeaderElements(columnId: string, selector: string): void;
  highlightColumnCells(columnId: string, color: string, excludedSwimlaneIds?: string[]): void;
  resetColumnCellStyles(columnId: string): void;

  // Person-limits methods
  getAssigneeFromIssue(issue: Element): string | null;
  getIssueTypeFromIssue(issue: Element): string | null;
  getColumnIdOfIssue(issue: Element): string | null;
  getColumnIdFromColumn(column: Element): string | null;
  getSwimlaneIdOfIssue(issue: Element): string | null;
  getParentGroups(): Element[];
  countIssueVisibility(element: Element, cssSelector: string): { total: number; hidden: number };
  setIssueBackgroundColor(issue: Element, color: string): void;
  resetIssueBackgroundColor(issue: Element): void;
  setIssueVisibility(issue: Element, visible: boolean): void;
  setSwimlaneVisibility(swimlane: Element, visible: boolean): void;
  setParentGroupVisibility(group: Element, visible: boolean): void;
}

export const BoardPagePageObject: IBoardPagePageObject = {
  _columnsCache: null as Array<{ id: string; name: string }> | null,

  setCachedColumns(columns: Array<{ id: string; name: string }>) {
    this._columnsCache = columns;
  },

  selectors: {
    pool: '[data-testid="software-board.board-container.board"]',
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
    boardColumnContainerCloud: '[data-testid="software-board.board-container.board"]',
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
    const columns = Array.from(document.querySelectorAll<HTMLElement>(this.selectors.column));
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].getAttribute('data-column-id') === columnId || columns[i].getAttribute('data-id') === columnId) {
        return columns[i];
      }
    }
    const draggableColumns = document.querySelectorAll<HTMLElement>(
      '[data-testid^="platform-board-kit.ui.column.draggable-column"]'
    );
    for (let i = 0; i < draggableColumns.length; i++) {
      const col = draggableColumns[i];
      if (col.getAttribute('data-column-id') === columnId || col.getAttribute('data-id') === columnId) {
        return col;
      }
    }
    if (this._columnsCache) {
      const cachedCol = this._columnsCache.find(c => c.id === columnId);
      if (cachedCol) {
        const allCols = columns.length > 0 ? columns : draggableColumns;
        const idx = this._columnsCache.indexOf(cachedCol);
        if (allCols[idx]) {
          return allCols[idx];
        }
      }
    }
    const header = document.querySelector(this.selectors.columnHeader);
    if (!header) return null;
    return header.querySelector<HTMLElement>(`[data-id="${columnId}"]`);
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
  },

  insertColumnHeaderHtml(columnId: string, html: string): void {
    const el = this.getColumnHeaderElement(columnId);
    if (!el) {
      return;
    }
    el.insertAdjacentHTML('beforeend', html);
  },

  insertBeforeColumn(columnId: string, html: string): void {
    const el = this._findColumnElement(columnId);
    if (!el) {
      return;
    }
    const attrName = 'data-jh-group-label';
    const existingLabel = el.querySelector(`[${attrName}]`);
    if (existingLabel) {
      existingLabel.innerHTML = html;
      this._attachPopupListener(existingLabel);
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.setAttribute(attrName, columnId);
    wrapper.innerHTML = html;
    wrapper.style.width = '100%';
    wrapper.style.overflow = 'hidden';
    wrapper.style.zIndex = '1';
    el.insertBefore(wrapper, el.firstChild);
    this._attachPopupListener(wrapper);
  },

  _attachPopupListener(wrapper: HTMLElement): void {
    const groupLabelDiv = wrapper.firstElementChild as HTMLElement | null;
    const groupNameSpan = groupLabelDiv?.querySelector('.groupName');
    if (!groupNameSpan) return;

    const hideAll = () => {
      document.querySelectorAll('[id^="jh-popup-"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    };
    const popupId = 'jh-popup-' + (wrapper.getAttribute('data-jh-group-label') || '0');
    const show = () => {
      hideAll();
      let popup = document.getElementById(popupId);
      if (!popup) {
        popup = document.createElement('span');
        popup.id = popupId;
        popup.style.cssText =
          'position:fixed;padding:8px 12px;background:#172b4d;color:#fff;font-size:12px;font-weight:600;border-radius:4px;white-space:nowrap;z-index:2147483647;box-shadow:0 4px 8px rgba(0,0,0,0.3);display:none';
        document.body.appendChild(popup);
        popup.addEventListener('mouseleave', hideAll);
      }
      popup.textContent = groupNameSpan.textContent;
      const rect = wrapper.getBoundingClientRect();
      popup.style.top = rect.bottom + 4 + 'px';
      popup.style.left = rect.left + 'px';
      popup.style.display = 'block';
    };

    wrapper.addEventListener('mouseenter', show);
    wrapper.addEventListener('mouseleave', hideAll);
  },

  removeColumnHeaderElements(columnId: string, selector: string): void {
    const el = this._findColumnElement(columnId);
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
