import { Token } from 'dioma';
import React from 'react';
import { createRoot } from 'react-dom/client';

class CardPageObject {
  constructor(private readonly card: Element) {}

  attach(ComponentToAttach: () => React.ReactNode, key: string) {
    let div = this.card.querySelector(`[data-jh-attached-key="${key}"]`);

    if (div) {
      return;
    }
    div = document.createElement('div');
    div.setAttribute('data-jh-attached-key', key);
    this.card.querySelector('.ghx-issue-content')?.appendChild(div);

    createRoot(div).render(<ComponentToAttach />);
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
  },

  classlist: {
    flagged: 'ghx-flagged',
  },

  getColumns(): string[] {
    const columns = Array.from(document.querySelectorAll(this.selectors.column)).map(
      column => column.textContent?.trim() || ''
    );
    return columns;
  },

  listenCards(callback: (cards: CardPageObject[]) => void) {
    const cards = Array.from(document.querySelectorAll(this.selectors.issue)).map(card => new CardPageObject(card));
    callback(cards);
  },
};

export const boardPagePageObjectToken = new Token<typeof BoardPagePageObject>('boardPagePageObjectToken');
