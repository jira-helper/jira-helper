import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoardPagePageObject } from './BoardPage';

describe('BoardPagePageObject', () => {
  beforeEach(() => {
    // Clear document before each test
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('listenCards', () => {
    it('should call callback immediately with initial cards', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const callback = vi.fn();

      // ACT
      BoardPagePageObject.listenCards(callback);

      // ASSERT
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            getIssueId: expect.any(Function),
            getCardElement: expect.any(Function),
          }),
        ])
      );
      const cards = callback.mock.calls[0][0];
      expect(cards).toHaveLength(1);
      expect(cards[0].getIssueId()).toBe('TEST-1');
    });

    it('should call callback when new cards are added', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const callback = vi.fn();
      BoardPagePageObject.listenCards(callback);

      // Clear initial call
      callback.mockClear();

      // ACT - Add new card
      const card2 = document.createElement('div');
      card2.className = 'ghx-issue';
      const keyElement2 = document.createElement('span');
      keyElement2.className = 'ghx-key';
      keyElement2.textContent = 'TEST-2';
      card2.appendChild(keyElement2);
      document.body.appendChild(card2);

      vi.advanceTimersByTime(1000);

      // ASSERT
      expect(callback).toHaveBeenCalledTimes(1);
      const cards = callback.mock.calls[0][0];
      expect(cards).toHaveLength(2);
      expect(cards.map(c => c.getIssueId())).toEqual(expect.arrayContaining(['TEST-1', 'TEST-2']));
    });

    it('should call callback when cards are removed', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const card2 = document.createElement('div');
      card2.className = 'ghx-issue';
      const keyElement2 = document.createElement('span');
      keyElement2.className = 'ghx-key';
      keyElement2.textContent = 'TEST-2';
      card2.appendChild(keyElement2);
      document.body.appendChild(card2);

      const callback = vi.fn();
      BoardPagePageObject.listenCards(callback);

      // Clear initial call
      callback.mockClear();

      // ACT - Remove card
      document.body.removeChild(card1);
      vi.advanceTimersByTime(1000);

      // ASSERT
      expect(callback).toHaveBeenCalledTimes(1);
      const cards = callback.mock.calls[0][0];
      expect(cards).toHaveLength(1);
      expect(cards[0].getIssueId()).toBe('TEST-2');
    });

    it('should call callback when DOM element is recreated with same issueId', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const callback = vi.fn();
      BoardPagePageObject.listenCards(callback);

      // Clear initial call
      callback.mockClear();

      // ACT - Recreate DOM element with same issueId (simulating Jira re-rendering)
      const oldCard1 = card1;
      document.body.removeChild(oldCard1);

      // Create new DOM element with same issueId
      const newCard1 = document.createElement('div');
      newCard1.className = 'ghx-issue';
      const newKeyElement1 = document.createElement('span');
      newKeyElement1.className = 'ghx-key';
      newKeyElement1.textContent = 'TEST-1'; // Same issueId
      newCard1.appendChild(newKeyElement1);
      document.body.appendChild(newCard1);

      vi.advanceTimersByTime(1000);

      // ASSERT
      expect(callback).toHaveBeenCalledTimes(1);
      const cards = callback.mock.calls[0][0];
      expect(cards).toHaveLength(1);
      expect(cards[0].getIssueId()).toBe('TEST-1');
      // Verify it's a different DOM element
      expect(cards[0].getCardElement()).not.toBe(oldCard1);
      expect(cards[0].getCardElement()).toBe(newCard1);
    });

    it('should not call callback when nothing changed after initial call', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const callback = vi.fn();
      const cleanup = BoardPagePageObject.listenCards(callback);

      // Wait for initial call to complete
      expect(callback).toHaveBeenCalledTimes(1);
      callback.mockClear();

      // ACT - Advance time without changing DOM (state should change from :new to :same)
      // First interval tick will detect change from :new to :same and call callback
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
      callback.mockClear();

      // Subsequent ticks should not call callback as state stays the same
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);

      // ASSERT - callback should not be called again
      expect(callback).not.toHaveBeenCalled();

      cleanup();
    });

    it('should clean up interval when cleanup function is called', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const callback = vi.fn();
      const cleanup = BoardPagePageObject.listenCards(callback);

      // Clear initial call
      callback.mockClear();

      // ACT - Cleanup and advance time
      cleanup();
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);

      // ASSERT
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple card recreations correctly', () => {
      // ARRANGE
      const card1 = document.createElement('div');
      card1.className = 'ghx-issue';
      const keyElement1 = document.createElement('span');
      keyElement1.className = 'ghx-key';
      keyElement1.textContent = 'TEST-1';
      card1.appendChild(keyElement1);
      document.body.appendChild(card1);

      const card2 = document.createElement('div');
      card2.className = 'ghx-issue';
      const keyElement2 = document.createElement('span');
      keyElement2.className = 'ghx-key';
      keyElement2.textContent = 'TEST-2';
      card2.appendChild(keyElement2);
      document.body.appendChild(card2);

      const callback = vi.fn();
      BoardPagePageObject.listenCards(callback);

      // Clear initial call
      callback.mockClear();

      // ACT - Recreate both cards
      const oldCard1 = card1;
      const oldCard2 = card2;
      document.body.removeChild(oldCard1);
      document.body.removeChild(oldCard2);

      const newCard1 = document.createElement('div');
      newCard1.className = 'ghx-issue';
      const newKeyElement1 = document.createElement('span');
      newKeyElement1.className = 'ghx-key';
      newKeyElement1.textContent = 'TEST-1';
      newCard1.appendChild(newKeyElement1);
      document.body.appendChild(newCard1);

      const newCard2 = document.createElement('div');
      newCard2.className = 'ghx-issue';
      const newKeyElement2 = document.createElement('span');
      newKeyElement2.className = 'ghx-key';
      newKeyElement2.textContent = 'TEST-2';
      newCard2.appendChild(newKeyElement2);
      document.body.appendChild(newCard2);

      vi.advanceTimersByTime(1000);

      // ASSERT
      expect(callback).toHaveBeenCalledTimes(1);
      const cards = callback.mock.calls[0][0];
      expect(cards).toHaveLength(2);
      const issueIds = cards.map(c => c.getIssueId()).sort();
      expect(issueIds).toEqual(['TEST-1', 'TEST-2']);
    });
  });
});

describe('CardPageObject', () => {
  it('getCardElement should return the card element', () => {
    // ARRANGE
    const cardElement = document.createElement('div');
    cardElement.className = 'ghx-issue';
    const keyElement = document.createElement('span');
    keyElement.className = 'ghx-key';
    keyElement.textContent = 'TEST-1';
    cardElement.appendChild(keyElement);
    document.body.appendChild(cardElement);

    // Create CardPageObject through listenCards
    let cardPageObject: any;
    const cleanup = BoardPagePageObject.listenCards(cards => {
      if (!cardPageObject) {
        cardPageObject = cards[0];
      }
    });

    // ACT
    const returnedElement = cardPageObject.getCardElement();

    // ASSERT - verify it returns an element and has the correct structure
    expect(returnedElement).toBeInstanceOf(Element);
    expect(returnedElement.className).toBe('ghx-issue');
    expect(returnedElement.querySelector('.ghx-key')?.textContent).toBe('TEST-1');
    // Verify it's the same DOM element by checking querySelector returns the same result
    expect(document.querySelector('.ghx-issue')).toBe(returnedElement);

    cleanup();
  });
});
