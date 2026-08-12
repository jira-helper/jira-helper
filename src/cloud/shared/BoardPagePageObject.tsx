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
  setCachedColumns(columns: Array<{ id: string; name: string; statusIds?: string[] }>): void;
  setBoardWorkData(data: CloudBoardWorkData | null): void;
  setSwimlanesCache(swimlanes: Array<{ id: string; name: string }> | null): void;
}

export type CloudBoardWorkData = {
  columns: Array<{ id: string; name: string; statusIds: string[] }>;
  swimlanes: Array<{ id: string; name: string; issueIds: number[] }>;
  issues: Array<{ id: number; statusId: string; typeName?: string }>;
};

type CachedColumn = { id: string; name: string; statusIds?: string[] };
type CachedSwimlane = { id: string; name: string };

type CloudBoardPagePageObjectInternal = IBoardPagePageObject & {
  _columnsCache: CachedColumn[] | null;
  _boardWorkData: CloudBoardWorkData | null;
  _swimlanesCache: CachedSwimlane[] | null;
  _findColumnElement(columnId: string): Element | null;
  _findAllColumnElements(columnId: string): Element[];
  _findHeaderElementInColumn(column: HTMLElement): HTMLElement;
  _getSwimlaneScrollContainers(): Element[];
  _resolveColumnIndex(columnId: string): number | null;
  _getAllColumnElementsFlat(): Element[];
  _getUniqueColumnElementsInRoot(root: Element): Element[];
  _getColumnSetSize(allColumns: Element[]): number | null;
  _getRepresentativeColumnElements(): Element[];
  _getSwimlaneRoot(scrollContainer: Element): Element;
  _getSwimlaneName(swimlaneRoot: Element, index: number): string;
  _resolveSwimlaneIdByName(name: string, index: number): string;
  _resolveStatusIdsForColumn(columnId: string): string[] | null;
  _getIssueCountFromWorkData(columnId: string, options?: ColumnIssueCountOptions): number | null;
};

export const BoardPagePageObject: CloudBoardPagePageObjectInternal = {
  columnHeaderRenderMode: 'cloud',

  _columnsCache: null as CachedColumn[] | null,
  _boardWorkData: null as CloudBoardWorkData | null,
  _swimlanesCache: null as CachedSwimlane[] | null,

  setCachedColumns(columns: Array<{ id: string; name: string; statusIds?: string[] }>) {
    this._columnsCache = columns;
  },

  setBoardWorkData(data: CloudBoardWorkData | null) {
    this._boardWorkData = data;
    if (data?.swimlanes?.length) {
      this._swimlanesCache = data.swimlanes.map(sw => ({ id: sw.id, name: sw.name }));
    }
    if (data?.columns?.length && this._columnsCache) {
      this._columnsCache = this._columnsCache.map(col => {
        const fromWork = data.columns.find(c => c.id === col.id);
        return fromWork?.statusIds?.length ? { ...col, statusIds: fromWork.statusIds } : col;
      });
    }
  },

  setSwimlanesCache(swimlanes: Array<{ id: string; name: string }> | null) {
    this._swimlanesCache = swimlanes;
  },

  selectors: {
    // Prefer current Cloud DOM (board.content.*); keep legacy software-board.* as fallback.
    pool: '[data-testid="board.content.board-wrapper"], [data-testid^="software-board.board-container.board"]',
    issue: '[data-testid="board.content.cell.card"], [data-testid="platform-board-kit.ui.card.card"]',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '[data-testid="software-board.layout.sidebar"]',
    column:
      '[data-testid="board.content.cell"], [data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"], [data-testid="platform-board-kit.ui.column.draggable-column"]',
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
    // Team-managed Group-by rows
    const teamManaged = Array.from(
      document.querySelectorAll('[data-testid="board.content.swimlane.scroll-container"]')
    );
    if (teamManaged.length > 0) {
      return teamManaged;
    }
    // Company-managed classic swimlanes (Expedite / Everything Else / …)
    return Array.from(document.querySelectorAll('[data-testid="platform-board-kit.ui.swimlane.swimlane-columns"]'));
  },

  _getSwimlaneRoot(scrollContainer: Element): Element {
    return (
      scrollContainer.closest('[data-testid="platform-board-kit.ui.swimlane.swimlane-wrapper"]') ??
      scrollContainer.closest('[role="listitem"]') ??
      scrollContainer
    );
  },

  _getSwimlaneName(swimlaneRoot: Element, index: number): string {
    const summary = swimlaneRoot.querySelector('[data-testid="platform-board-kit.ui.swimlane.summary-section"]');
    const summaryText = summary?.textContent?.trim();
    if (summaryText) {
      return summaryText;
    }

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

  _resolveSwimlaneIdByName(name: string, index: number): string {
    if (this._swimlanesCache?.length) {
      const byName = this._swimlanesCache.find(sw => sw.name === name);
      if (byName) return byName.id;
      if (this._swimlanesCache[index]) return this._swimlanesCache[index].id;
    }
    return `swimlane-${index}`;
  },

  getSwimlanes(): Array<{ id: string; element: Element; header: Element }> {
    return this._getSwimlaneScrollContainers().map((scroll, index) => {
      const element = this._getSwimlaneRoot(scroll);
      const name = this._getSwimlaneName(element, index);
      const id = this._resolveSwimlaneIdByName(name, index);
      const header =
        element.querySelector('[data-testid="platform-board-kit.ui.swimlane.summary-section"]') ??
        Array.from(element.querySelectorAll('button')).find(btn => /[«"]/.test(btn.textContent ?? '')) ??
        element.querySelector('button') ??
        element;
      return { id, element, header };
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
    const scrollSelector =
      '[data-testid="board.content.swimlane.scroll-container"], [data-testid="platform-board-kit.ui.swimlane.swimlane-columns"]';
    const scroll = swimlane.matches?.(scrollSelector) ? swimlane : swimlane.querySelector(scrollSelector);
    const root = scroll ?? swimlane;
    return this._getUniqueColumnElementsInRoot(root);
  },

  getColumnHeaderElement(columnId: string): HTMLElement | null {
    const column = this._findColumnElement(columnId);
    if (!column) {
      return null;
    }

    return this._findHeaderElementInColumn(column as HTMLElement);
  },

  _getAllColumnElementsFlat(): Element[] {
    const all = Array.from(document.querySelectorAll(this.selectors.column));
    return all.filter(el => {
      const styledParent = el.closest('[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"]');
      if (styledParent && styledParent !== el) {
        return false;
      }
      return true;
    });
  },

  _getUniqueColumnElementsInRoot(root: Element): Element[] {
    const styledWrappers = Array.from(
      root.querySelectorAll('[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"]')
    );
    if (styledWrappers.length > 0) {
      return styledWrappers;
    }

    const cells = Array.from(root.querySelectorAll('[data-testid="board.content.cell"]'));
    if (cells.length > 0) {
      return cells;
    }

    return Array.from(root.querySelectorAll('[data-testid="platform-board-kit.ui.column.draggable-column"]')).filter(
      el => {
        const styledParent = el.closest('[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"]');
        return !styledParent || styledParent === el;
      }
    );
  },

  /**
   * Fallback when swimlane roots are not detected yet: multiple flat copies of the
   * same column set (one per swimlane). Prefer `_getSwimlaneScrollContainers()`.
   */
  _getColumnSetSize(allColumns: Element[]): number | null {
    const cached = this._columnsCache?.length ?? 0;
    if (cached > 0 && allColumns.length > cached && allColumns.length % cached === 0) {
      return cached;
    }
    return null;
  },

  _getRepresentativeColumnElements(): Element[] {
    const swimlaneScrolls = this._getSwimlaneScrollContainers();
    if (swimlaneScrolls.length > 0) {
      return this._getUniqueColumnElementsInRoot(swimlaneScrolls[0]);
    }
    const all = this._getAllColumnElementsFlat();
    const setSize = this._getColumnSetSize(all);
    return setSize != null ? all.slice(0, setSize) : all;
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
    if (this._swimlanesCache?.length) {
      return this._swimlanesCache.map(s => s.id);
    }
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
    const byAttr = this._getAllColumnElementsFlat().filter(
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
        .map(scroll => this._getUniqueColumnElementsInRoot(scroll)[index])
        .filter((col): col is Element => Boolean(col));
    }

    const all = this._getAllColumnElementsFlat();
    const setSize = this._getColumnSetSize(all);
    if (setSize != null) {
      const copies: Element[] = [];
      for (let i = index; i < all.length; i += setSize) {
        copies.push(all[i]);
      }
      return copies;
    }

    const flat = all[index];
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

    const target = header ?? column;
    // Cloud sticky overlay is often a parent of the header container; painting only the
    // inner node leaves Jira's translucent sticky wrapper (cards show through).
    let ancestor: HTMLElement | null = target.parentElement;
    while (ancestor && column.contains(ancestor)) {
      if (ancestor.style.position === 'sticky' || getComputedStyle(ancestor).position === 'sticky') {
        return ancestor;
      }
      ancestor = ancestor.parentElement;
    }
    return target;
  },

  _resolveStatusIdsForColumn(columnId: string): string[] | null {
    const cached = this._columnsCache?.find(c => c.id === columnId);
    if (cached?.statusIds?.length) {
      return cached.statusIds;
    }

    const fromWork = this._boardWorkData?.columns.find(c => c.id === columnId);
    if (fromWork?.statusIds?.length) {
      return fromWork.statusIds;
    }

    const index = this._resolveColumnIndex(columnId);
    if (index != null) {
      const byIndex = this._columnsCache?.[index];
      if (byIndex?.statusIds?.length) return byIndex.statusIds;
      const workByIndex = this._boardWorkData?.columns[index];
      if (workByIndex?.statusIds?.length) return workByIndex.statusIds;
    }

    return null;
  },

  _getIssueCountFromWorkData(columnId: string, options?: ColumnIssueCountOptions): number | null {
    if (!this._boardWorkData) {
      return null;
    }

    const statusIds = this._resolveStatusIdsForColumn(columnId);
    if (!statusIds?.length) {
      return null;
    }

    const statusSet = new Set(statusIds);
    let matchingIssues = this._boardWorkData.issues.filter(issue => statusSet.has(issue.statusId));

    const ignoredSwimlanes = new Set(options?.ignoredSwimlanes ?? []);
    if (ignoredSwimlanes.size > 0) {
      const excludedIssueIds = new Set<number>();
      for (const swimlane of this._boardWorkData.swimlanes) {
        if (ignoredSwimlanes.has(swimlane.id)) {
          swimlane.issueIds.forEach(id => excludedIssueIds.add(id));
        }
      }
      matchingIssues = matchingIssues.filter(issue => !excludedIssueIds.has(issue.id));
    }

    if (options?.includedIssueTypes?.length) {
      const types = new Set(options.includedIssueTypes);
      matchingIssues = matchingIssues.filter(issue => issue.typeName != null && types.has(issue.typeName));
    }

    return matchingIssues.length;
  },

  getIssueCountInColumn(columnId: string, options?: ColumnIssueCountOptions): number {
    const fromApi = this._getIssueCountFromWorkData(columnId, options);
    if (fromApi != null) {
      return fromApi;
    }

    const ignoredSwimlanes = new Set<string>(options?.ignoredSwimlanes ?? []);
    const cssFilter = options?.cssFilter;
    const includedTypes = options?.includedIssueTypes?.length ? new Set(options.includedIssueTypes) : null;

    const columns = this._findAllColumnElements(columnId);
    return columns.reduce((total, col) => {
      if (ignoredSwimlanes.size > 0) {
        const swimlaneId = this.getSwimlaneIdOfIssue(col);
        if (swimlaneId && ignoredSwimlanes.has(swimlaneId)) {
          return total;
        }
      }

      let issues = Array.from(col.querySelectorAll(this.selectors.issue));
      if (cssFilter) {
        issues = issues.filter(issue => issue.matches(cssFilter));
      }
      if (includedTypes) {
        issues = issues.filter(issue => {
          const typeName = this.getIssueTypeFromIssue(issue);
          return typeName != null && includedTypes.has(typeName);
        });
      }
      return total + issues.length;
    }, 0);
  },

  styleColumnHeader(columnId: string, styles: Partial<CSSStyleDeclaration>): void {
    this._findAllColumnElements(columnId).forEach(col => {
      const el = this._findHeaderElementInColumn(col as HTMLElement);
      Object.assign(el.style, styles);
    });
  },

  resetColumnHeaderStyles(columnId: string): void {
    this._findAllColumnElements(columnId).forEach(col => {
      const el = this._findHeaderElementInColumn(col as HTMLElement);
      const { style } = el;
      style.removeProperty('background-color');
      style.removeProperty('border-top');
      style.removeProperty('border-top-left-radius');
      style.removeProperty('border-top-right-radius');
      style.removeProperty('padding-top');
      style.removeProperty('box-sizing');
      style.removeProperty('position');
    });
  },

  insertColumnHeaderHtml(columnId: string, html: string): void {
    this._findAllColumnElements(columnId).forEach(col => {
      const el = this._findHeaderElementInColumn(col as HTMLElement);
      el.insertAdjacentHTML('beforeend', html);
    });
  },

  removeColumnHeaderElements(columnId: string, selector: string): void {
    this._findAllColumnElements(columnId).forEach(col => {
      const el = this._findHeaderElementInColumn(col as HTMLElement);
      el.querySelectorAll(selector).forEach(e => e.remove());
    });
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
    const scroll = column.closest(
      '[data-testid="board.content.swimlane.scroll-container"], [data-testid="platform-board-kit.ui.swimlane.swimlane-columns"]'
    );
    if (scroll) {
      const siblings = this._getUniqueColumnElementsInRoot(scroll);
      const index = siblings.indexOf(column);
      if (index < 0) return null;
      if (this._columnsCache?.[index]) {
        return this._columnsCache[index].id;
      }
      return `column-${index}`;
    }

    const all = this._getAllColumnElementsFlat();
    const absoluteIndex = all.indexOf(column);
    if (absoluteIndex < 0) return null;
    const setSize = this._getColumnSetSize(all);
    const index = setSize != null ? absoluteIndex % setSize : absoluteIndex;
    if (this._columnsCache?.[index]) {
      return this._columnsCache[index].id;
    }
    return `column-${index}`;
  },

  getSwimlaneIdOfIssue(issue: Element): string | null {
    const scroll = issue.closest(
      '[data-testid="board.content.swimlane.scroll-container"], [data-testid="platform-board-kit.ui.swimlane.swimlane-columns"]'
    );
    if (!scroll) return null;
    const swimlaneRoot = this._getSwimlaneRoot(scroll);
    const scrolls = this._getSwimlaneScrollContainers();
    const index = scrolls.indexOf(scroll);
    if (index < 0) return null;
    const name = this._getSwimlaneName(swimlaneRoot, index);
    return this._resolveSwimlaneIdByName(name, index);
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
