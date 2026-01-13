import { Container, Token } from 'dioma';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export interface IBoardBacklogPagePageObject {
  selectors: {
    backlogColumn: string;
    backlogIssueCard: string;
  };

  classlist: {};

  getHtml(): string;
  listenCards(callback: (cards: BacklogIssueCardPageObject[]) => void): () => void;
}

class BacklogIssueCardPageObject {
  constructor(private readonly card: Element) {}

  selectors = {
    end: '.ghx-end',
  };

  getIssueId() {
    return this.card.getAttribute('data-issue-key');
  }

  getCardElement() {
    return this.card;
  }

  attach(ComponentToAttach: React.ComponentType<{ issueId: string }>, key: string) {
    let div = this.card.querySelector(`[data-jh-attached-key="${key}"]`);

    if (div) {
      return;
    }

    div = document.createElement('div');
    div.setAttribute('data-jh-attached-key', key);

    this.card.querySelector(this.selectors.end)?.before(div);

    const root = createRoot(div);
    root.render(<ComponentToAttach issueId={this.getIssueId()!} />);

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

export const BoardBacklogPagePageObject: IBoardBacklogPagePageObject = {
  selectors: {
    backlogColumn: '#ghx-backlog-column',
    backlogIssueCard: '.js-issue[data-issue-key]',
  },

  classlist: {},

  listenCards(callback: (cards: BacklogIssueCardPageObject[]) => void) {
    // Map to track the last known DOM element for each issueId
    // This allows us to detect when a card DOM element is recreated even if the issueId stays the same
    const cardElementsMap = new Map<string, Element>();
    let currentCards = '';
    const getCards = () => {
      const cards = Array.from(document.querySelectorAll(this.selectors.backlogIssueCard)).map(
        card => new BacklogIssueCardPageObject(card)
      );
      return cards;
    };
    const getCurrentCardsState = (cards: BacklogIssueCardPageObject[]) => {
      const state: string[] = [];
      const currentIssueIds = new Set<string>();

      for (const card of cards) {
        const issueId = card.getIssueId();
        if (!issueId) continue;
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

  getHtml(): string {
    return document.body.innerHTML;
  },
};

export const boardBacklogPagePageObjectToken = new Token<IBoardBacklogPagePageObject>(
  'boardBacklogPagePageObjectToken'
);

export const registerBoardBacklogPagePageObjectInDI = (container: Container) => {
  container.register({ token: boardBacklogPagePageObjectToken, value: BoardBacklogPagePageObject });
};
