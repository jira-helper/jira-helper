/* eslint-disable @typescript-eslint/no-unused-vars -- Cloud PageObject implements shared interface methods that are no-ops on Jira Cloud. */
// src/cloud/shared/BoardPagePageObject.ts
// Page Object для работы с доской Jira Cloud

import React from 'react';

import { createRoot, Root } from 'react-dom/client';
import type {
  ColumnIssueCountOptions,
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
  _findAllColumnElements(columnId: string): Element[];
  _findHeaderElementInColumn(column: HTMLElement): HTMLElement;
  _getSwimlaneScrollContainers(): Element[];
  _resolveColumnIndex(columnId: string): number | null;
  _getRepresentativeColumnElements(): Element[];
  _getSwimlaneRoot(scrollContainer: Element): Element;
  _getSwimlaneName(swimlaneRoot: Element, index: number): string;
};

export const BoardPagePageObject: CloudBoardPagePageObjectInternal = {
  columnHeaderRenderMode: 'cloud',

  _columnsCache: null as Array<{ id: string; name: string }> | null,

  setCachedColumns(columns: Array<{ id: string; name: string }>) {
    this._columnsCache = columns;
  },

  selectors: {
    // Prefer current Cloud DOM (board.content.*); keep legacy software-board.* as fallback.
    pool: '[data-testid="board.content.board-wrapper"], [data-testid^="software-board.board-container.board"]',
    issue: '[data-testid="board.content.cell.card"], [data-testid="platform-board-kit.ui.card.card"]',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '[data-testid="software-board.layout.sidebar"]',
    column: '[data-testid="board.content.cell"], [data-testid*="draggable-column"]',
    columnHeader:
      '[data-testid="board.content.cell.column-header"], [data-testid="platform-board-kit.ui.column-header"]',
    columnTitle:
      '[data-testid="board.content.cell.column-header.name"], [data-testid="platform-board-kit.ui.column-header-content"]',
    daysInColumn: '.ghx-days',
    // Team-managed Group by rows use swimlane.scroll-container; header is the collapse control in the listitem.
    swimlaneHeader: '[data-testid="board.content.swimlane.scroll-container"]',
    swimlaneRow: '[data-testid="board.content.swimlane.scroll-container"]',
    avatarImg: '[data-testid="platform-board-kit.ui.avatar"]',
    issueType: '[data-testid="platform-board-kit.ui.type-badge"]',
    parentGroup: '',
    // Keep primary header target as legacy controls-bar; BoardSettings falls back to
    // horizontal-nav-header.ui.project-header.header when this is absent.
    boardHeaderTarget: '[data-testid="software-board.header.controls-bar"]',
    issueCardCloud: '[data-testid="board.content.cell.card"], [data-testid="platform-board-kit.ui.card.card"]',
    boardHeaderCloud: '[data-testid="software-board.header.controls-bar"]',
    boardContainerCloud: '[data-testid="board.content.board-wrapper"], [data-testid^="software-board.board-container"]',
    boardColumnContainerCloud:
      '[data-testid="board.content.board-wrapper"], [data-testid^="software-board.board-container.board"]',
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

  _getSwimlaneScrollContainers(): Element[] {
    return Array.from(document.querySelectorAll('[data-testid="board.content.swimlane.scroll-container"]'));
  },

  _getSwimlaneRoot(scrollContainer: Element): Element {
    return scrollContainer.closest('[role="listitem"]') ?? scrollContainer;
  },

  _getSwimlaneName(swimlaneRoot: Element, index: number): string {
    const labeled = swimlaneRoot.querySelector('[aria-label*="группе"], [aria-label*="group"]');
    const aria = labeled?.getAttribute('aria-label') ?? '';
    const ariaMatch = aria.match(/[«"](.+?)[»"]/);
    if (ariaMatch?.[1]) return ariaMatch[1].trim();

    const buttons = Array.from(swimlaneRoot.querySelectorAll('button'));
    for (const button of buttons) {
      const text = button.textContent?.trim() ?? '';
      const match = text.match(/[«"](.+?)[»"]/);
      if (match?.[1]) return match[1].trim();
    }
    return `swimlane-${index}`;
  },

  getSwimlanes(): Array<{ id: string; element: Element; header: Element }> {
    return this._getSwimlaneScrollContainers().map((scroll, index) => {
      const element = this._getSwimlaneRoot(scroll);
      const name = this._getSwimlaneName(element, index);
      const header =
        Array.from(element.querySelectorAll('button')).find(btn => /[«"]/.test(btn.textContent ?? '')) ??
        element.querySelector('button') ??
        element;
      return { id: `swimlane-${index}`, element, header };
    });
  },

  getSwimlaneHeader(swimlaneId: string): Element | null {
    return this.getSwimlanes().find(sw => sw.id === swimlaneId)?.header ?? null;
  },

  getIssueCountInSwimlane(swimlaneId: string, _options?: IssueCountOptions): number {
    const swimlane = this.getSwimlanes().find(sw => sw.id === swimlaneId);
    if (!swimlane) return 0;
    return swimlane.element.querySelectorAll(this.selectors.issue).length;
  },

  getIssueCountByColumn(swimlaneId: string, _options?: IssueCountOptions): number[] {
    const swimlane = this.getSwimlanes().find(sw => sw.id === swimlaneId);
    if (!swimlane) {
      return this.getOrderedColumnIds().map(columnId => this.getIssueCountInColumn(columnId));
    }
    return this.getColumnsInSwimlane(swimlane.element).map(
      column => column.querySelectorAll(this.selectors.issue).length
    );
  },

  getIssueCountForColumns(swimlaneId: string, columns: string[], _options?: IssueCountOptions): number {
    const swimlane = this.getSwimlanes().find(sw => sw.id === swimlaneId);
    if (!swimlane) {
      return columns.reduce((total, columnId) => total + this.getIssueCountInColumn(columnId), 0);
    }
    return columns.reduce((total, columnId) => {
      const index = this._resolveColumnIndex(columnId);
      if (index == null) return total;
      const col = this.getColumnsInSwimlane(swimlane.element)[index];
      return total + (col ? col.querySelectorAll(this.selectors.issue).length : 0);
    }, 0);
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
    return this._getSwimlaneScrollContainers().length > 0;
  },

  getColumnElements(): Element[] {
    return Array.from(document.querySelectorAll(this.selectors.column));
  },

  getColumnsInSwimlane(swimlane: Element): Element[] {
    const scroll = swimlane.matches?.('[data-testid="board.content.swimlane.scroll-container"]')
      ? swimlane
      : swimlane.querySelector('[data-testid="board.content.swimlane.scroll-container"]');
    const root = scroll ?? swimlane;
    return Array.from(root.querySelectorAll(this.selectors.column));
  },

  getColumnHeaderElement(columnId: string): HTMLElement | null {
    const column = this._findColumnElement(columnId);
    if (!column) {
      return null;
    }

    return this._findHeaderElementInColumn(column as HTMLElement);
  },

  _getRepresentativeColumnElements(): Element[] {
    const swimlaneScrolls = this._getSwimlaneScrollContainers();
    if (swimlaneScrolls.length > 0) {
      return Array.from(swimlaneScrolls[0].querySelectorAll(this.selectors.column));
    }
    return Array.from(document.querySelectorAll(this.selectors.column));
  },

  getOrderedColumnIds(): string[] {
    if (this._columnsCache && this._columnsCache.length > 0) {
      return this._columnsCache.map(c => c.id);
    }
    return this._getRepresentativeColumnElements().map((_, i) => `column-${i}`);
  },

  getOrderedColumns(): Array<{ id: string; name: string }> {
    if (this._columnsCache && this._columnsCache.length > 0) {
      return this._columnsCache;
    }
    return this._getRepresentativeColumnElements().map((col, index) => {
      const heading = col.querySelector('h2, h3, [title]');
      let name = heading?.getAttribute('title') || heading?.textContent?.replace(/\s*\d+\s*$/, '').trim() || '';
      if (!name) {
        const titleEl = col.querySelector(this.selectors.columnTitle);
        name = titleEl?.textContent?.trim().split('\n')[0]?.trim() ?? '';
      }
      return { id: `column-${index}`, name: name || `Column ${index + 1}` };
    });
  },

  getSwimlaneIds(): string[] {
    return this.getSwimlanes().map(s => s.id);
  },

  _resolveColumnIndex(columnId: string): number | null {
    const match = columnId.match(/^column-(\d+)$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    if (this._columnsCache) {
      const idx = this._columnsCache.findIndex(c => c.id === columnId);
      if (idx >= 0) return idx;
    }
    const representatives = this._getRepresentativeColumnElements();
    for (let i = 0; i < representatives.length; i++) {
      const titleEl =
        representatives[i].querySelector(this.selectors.columnTitle) || representatives[i].querySelector('h2, h3');
      const title = titleEl?.textContent?.trim().split('\n')[0]?.trim() ?? '';
      if (title === columnId) return i;
    }
    return null;
  },

  _findAllColumnElements(columnId: string): Element[] {
    const byAttr = Array.from(document.querySelectorAll(this.selectors.column)).filter(
      col => col.getAttribute('data-column-id') === columnId || col.getAttribute('data-id') === columnId
    );
    if (byAttr.length > 0) {
      return byAttr;
    }

    const index = this._resolveColumnIndex(columnId);
    if (index == null) {
      return [];
    }

    const swimlaneScrolls = this._getSwimlaneScrollContainers();
    if (swimlaneScrolls.length > 0) {
      return swimlaneScrolls
        .map(scroll => scroll.querySelectorAll(this.selectors.column)[index])
        .filter((col): col is Element => Boolean(col));
    }

    const flat = document.querySelectorAll(this.selectors.column)[index];
    return flat ? [flat] : [];
  },

  _findColumnElement(columnId: string): Element | null {
    return this._findAllColumnElements(columnId)[0] ?? null;
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

  getIssueCountInColumn(columnId: string, options?: ColumnIssueCountOptions): number {
    const ignoredSwimlanes = new Set<string>(options?.ignoredSwimlanes ?? []);
    const columns = this._findAllColumnElements(columnId);
    return columns.reduce((total, col) => {
      if (ignoredSwimlanes.size > 0) {
        const swimlaneId = this.getSwimlaneIdOfIssue(col);
        if (swimlaneId && ignoredSwimlanes.has(swimlaneId)) {
          return total;
        }
      }
      return total + col.querySelectorAll(this.selectors.issue).length;
    }, 0);
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
    style.removeProperty('padding-top');
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

  highlightColumnCells(columnId: string, color: string, excludedSwimlaneIds?: string[]): void {
    const excluded = new Set(excludedSwimlaneIds ?? []);
    this._findAllColumnElements(columnId).forEach(col => {
      if (excluded.size > 0) {
        const swimlaneId = this.getSwimlaneIdOfIssue(col);
        if (swimlaneId && excluded.has(swimlaneId)) return;
      }
      (col as HTMLElement).style.backgroundColor = color;
    });
  },

  resetColumnCellStyles(columnId: string): void {
    this._findAllColumnElements(columnId).forEach(col => {
      (col as HTMLElement).style.backgroundColor = '';
    });
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
    const columnEl = issue.closest(this.selectors.column);
    if (!columnEl) return null;
    return this.getColumnIdFromColumn(columnEl);
  },

  getColumnIdFromColumn(column: Element): string | null {
    const scroll = column.closest('[data-testid="board.content.swimlane.scroll-container"]');
    const siblings = scroll
      ? Array.from(scroll.querySelectorAll(this.selectors.column))
      : this._getRepresentativeColumnElements();
    const index = siblings.indexOf(column);
    if (index < 0) return null;
    // Prefer positional ids — person-limits settings store column-N from editData.
    return `column-${index}`;
  },

  getSwimlaneIdOfIssue(issue: Element): string | null {
    const scroll = issue.closest('[data-testid="board.content.swimlane.scroll-container"]');
    if (!scroll) return null;
    const scrolls = this._getSwimlaneScrollContainers();
    const index = scrolls.indexOf(scroll);
    return index >= 0 ? `swimlane-${index}` : null;
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
    // Marker so AssigneeHighlighterApplier does not wipe person-limits coloring.
    el.setAttribute('data-jh-wip-overloaded', 'true');
    el.classList.add('jh-wip-overloaded');
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
    el.removeAttribute('data-jh-wip-overloaded');
    el.classList.remove('jh-wip-overloaded');
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
