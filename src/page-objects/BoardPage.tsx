import { Container, Token } from 'dioma';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { onDOMChange } from 'src/shared/domUtils';

class CardPageObject {
  selectors = {
    issueKey: '.ghx-key',
  };

  constructor(private readonly card: Element) {}

  getIssueId() {
    return this.card.querySelector(this.selectors.issueKey)?.textContent?.trim() as string;
  }

  attach(ComponentToAttach: React.ComponentType<{ issueId: string }>, key: string) {
    let div = this.card.querySelector(`[data-jh-attached-key="${key}"]`);

    if (div) {
      return;
    }
    div = document.createElement('div');
    div.setAttribute('data-jh-attached-key', key);
    this.card.querySelector('.ghx-issue-content')?.appendChild(div);

    createRoot(div).render(<ComponentToAttach issueId={this.getIssueId()} />);
  }
}

export const BoardPagePageObject = {
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
};

export const boardPagePageObjectToken = new Token<typeof BoardPagePageObject>('boardPagePageObjectToken');

export const registerBoardPagePageObjectInDI = (container: Container) => {
  container.register({ token: boardPagePageObjectToken, value: BoardPagePageObject });
};
