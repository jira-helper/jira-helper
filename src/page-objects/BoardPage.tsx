import { Container, Token } from 'dioma';
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
    options?: { position: 'aftersummary' | 'beforeend' }
  ) {
    let div = this.card.querySelector(`[data-jh-attached-key="${key}"]`);

    if (div) {
      return;
    }

    div = document.createElement('div');
    div.setAttribute('data-jh-attached-key', key);
    if (options?.position === 'aftersummary') {
      // ghx-summary is inside ghx-issue-fields and ghx-issue-fields width is not 100%
      this.card.querySelector('.ghx-issue-fields')?.after(div);
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
  },

  classlist: {
    flagged: 'ghx-flagged',
  },

  getColumns(): string[] {
    return Array.from(
      document.querySelector(this.selectors.columnHeader)?.querySelectorAll(this.selectors.columnTitle) || []
    ).map(column => column.textContent?.trim() || '');
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
};

export const boardPagePageObjectToken = new Token<IBoardPagePageObject>('boardPagePageObjectToken');

export const registerBoardPagePageObjectInDI = (container: Container) => {
  container.register({ token: boardPagePageObjectToken, value: BoardPagePageObject });
};
