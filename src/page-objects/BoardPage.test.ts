import React from 'react';
import { act } from '@testing-library/react';
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
      expect(cards.map((c: { getIssueId: () => string }) => c.getIssueId())).toEqual(
        expect.arrayContaining(['TEST-1', 'TEST-2'])
      );
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
      const issueIds = cards.map((c: { getIssueId: () => string }) => c.getIssueId()).sort();
      expect(issueIds).toEqual(['TEST-1', 'TEST-2']);
    });
  });
});

describe('BoardPagePageObject swimlane methods', () => {
  const setupSwimlaneDOM = () => {
    const headerGroup = document.createElement('div');
    headerGroup.id = 'ghx-column-headers';
    headerGroup.innerHTML = `
      <ul class="ghx-columns">
        <li class="ghx-column" data-id="col1" data-column-id="col1"><span class="ghx-column-title">To Do</span></li>
        <li class="ghx-column" data-id="col2" data-column-id="col2"><span class="ghx-column-title">In Progress</span></li>
        <li class="ghx-column" data-id="col3" data-column-id="col3"><span class="ghx-column-title">Done</span></li>
      </ul>
    `;
    document.body.appendChild(headerGroup);

    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="sw1">
        <div class="ghx-swimlane-header">
          <span class="ghx-heading">Swimlane 1</span>
        </div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" data-issue-key="ISSUE-1"></div>
            <div class="ghx-issue ghx-done" data-issue-key="ISSUE-2"></div>
            <div class="ghx-issue ghx-issue-subtask" data-issue-key="ISSUE-3"></div>
          </div>
          <div class="ghx-column" data-column-id="col2">
            <div class="ghx-issue" data-issue-key="ISSUE-4"></div>
          </div>
          <div class="ghx-column" data-column-id="col3"></div>
        </div>
      </div>
      <div class="ghx-swimlane" swimlane-id="sw2">
        <div class="ghx-swimlane-header">
          <span class="ghx-heading">Swimlane 2</span>
        </div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1"></div>
          <div class="ghx-column" data-column-id="col2">
            <div class="ghx-issue" data-issue-key="ISSUE-5"></div>
          </div>
          <div class="ghx-column" data-column-id="col3"></div>
        </div>
      </div>
    `;
    document.body.appendChild(pool);
    return { pool, headerGroup };
  };

  it('getSwimlanes should return all swimlanes with id, element and header', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const swimlanes = BoardPagePageObject.getSwimlanes();

    expect(swimlanes).toHaveLength(2);
    expect(swimlanes[0].id).toBe('sw1');
    expect(swimlanes[0].element).toBeInstanceOf(Element);
    expect(swimlanes[0].header).toBeInstanceOf(Element);
    expect(swimlanes[0].header.querySelector('.ghx-heading')?.textContent).toBe('Swimlane 1');
    expect(swimlanes[1].id).toBe('sw2');
  });

  it('getSwimlaneHeader should return header for given swimlane id', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const header = BoardPagePageObject.getSwimlaneHeader('sw1');

    expect(header).not.toBeNull();
    expect(header?.querySelector('.ghx-heading')?.textContent).toBe('Swimlane 1');
  });

  it('getSwimlaneHeader should return null for non-existent swimlane', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const header = BoardPagePageObject.getSwimlaneHeader('non-existent');

    expect(header).toBeNull();
  });

  it('getIssueCountInSwimlane should count all issues by default', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    expect(BoardPagePageObject.getIssueCountInSwimlane('sw1')).toBe(4); // ISSUE-1, ISSUE-2, ISSUE-3, ISSUE-4
    expect(BoardPagePageObject.getIssueCountInSwimlane('sw2')).toBe(1); // ISSUE-5
  });

  it('getIssueCountInSwimlane should exclude done and subtasks when options provided', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const options = { excludeDone: true, excludeSubtasks: true };
    expect(BoardPagePageObject.getIssueCountInSwimlane('sw1', options)).toBe(2); // ISSUE-1, ISSUE-4
    expect(BoardPagePageObject.getIssueCountInSwimlane('sw2', options)).toBe(1); // ISSUE-5
  });

  it('getIssueCountByColumn should return counts per column in order', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const counts = BoardPagePageObject.getIssueCountByColumn('sw1');

    expect(counts).toEqual([3, 1, 0]); // col1: 3 (all issues), col2: 1 (ISSUE-4), col3: 0
  });

  it('getIssueCountByColumn should exclude done and subtasks when options provided', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const options = { excludeDone: true, excludeSubtasks: true };
    const counts = BoardPagePageObject.getIssueCountByColumn('sw1', options);

    expect(counts).toEqual([1, 1, 0]); // col1: 1 (ISSUE-1 only), col2: 1 (ISSUE-4), col3: 0
  });

  it('getIssueCountForColumns should count all issues by default', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    expect(BoardPagePageObject.getIssueCountForColumns('sw1', ['To Do', 'In Progress'])).toBe(4);
    expect(BoardPagePageObject.getIssueCountForColumns('sw1', ['To Do'])).toBe(3);
    expect(BoardPagePageObject.getIssueCountForColumns('sw1', ['Done'])).toBe(0);
  });

  it('getIssueCountForColumns should exclude done and subtasks when options provided', () => {
    document.body.innerHTML = '';
    setupSwimlaneDOM();

    const options = { excludeDone: true, excludeSubtasks: true };
    expect(BoardPagePageObject.getIssueCountForColumns('sw1', ['To Do', 'In Progress'], options)).toBe(2);
    expect(BoardPagePageObject.getIssueCountForColumns('sw1', ['To Do'], options)).toBe(1);
  });

  it('insertSwimlaneComponent should insert React component into header', () => {
    document.body.innerHTML = '';
    const { pool } = setupSwimlaneDOM();
    const header = pool.querySelector('.ghx-swimlane-header')!;
    const Badge = () => React.createElement('span', { 'data-testid': 'limit-badge' }, '3/5');

    act(() => {
      BoardPagePageObject.insertSwimlaneComponent(header, React.createElement(Badge), 'limit-badge');
    });

    const container = header.querySelector('[data-jh-attached-key="limit-badge"]');
    expect(container).not.toBeNull();
    expect(container?.querySelector('[data-testid="limit-badge"]')?.textContent).toBe('3/5');
  });

  it('insertSwimlaneComponent should not duplicate when called twice with same key', () => {
    document.body.innerHTML = '';
    const { pool } = setupSwimlaneDOM();
    const header = pool.querySelector('.ghx-swimlane-header')!;
    const Badge = () => React.createElement('span', { 'data-testid': 'limit-badge' }, '3/5');

    BoardPagePageObject.insertSwimlaneComponent(header, React.createElement(Badge), 'limit-badge');
    BoardPagePageObject.insertSwimlaneComponent(header, React.createElement(Badge), 'limit-badge');

    const containers = header.querySelectorAll('[data-jh-attached-key="limit-badge"]');
    expect(containers).toHaveLength(1);
  });

  it('removeSwimlaneComponent should remove component and unmount React root', () => {
    document.body.innerHTML = '';
    const { pool } = setupSwimlaneDOM();
    const header = pool.querySelector('.ghx-swimlane-header')!;
    const Badge = () => React.createElement('span', { 'data-testid': 'limit-badge' }, '3/5');

    BoardPagePageObject.insertSwimlaneComponent(header, React.createElement(Badge), 'limit-badge');
    expect(header.querySelector('[data-jh-attached-key="limit-badge"]')).not.toBeNull();

    BoardPagePageObject.removeSwimlaneComponent(header, 'limit-badge');
    expect(header.querySelector('[data-jh-attached-key="limit-badge"]')).toBeNull();
  });

  it('highlightSwimlane should apply exceeded styles when exceeded is true', () => {
    document.body.innerHTML = '';
    const { pool } = setupSwimlaneDOM();
    const header = pool.querySelector('.ghx-swimlane-header')!;
    const swimlane = header.closest('.ghx-swimlane') as HTMLElement;

    BoardPagePageObject.highlightSwimlane(header, true);

    expect(swimlane.style.backgroundColor).toBe('rgb(255, 86, 48)');
    expect((header as HTMLElement).style.backgroundColor).toBe('rgb(255, 86, 48)');
  });

  it('highlightSwimlane should remove styles when exceeded is false', () => {
    document.body.innerHTML = '';
    const { pool } = setupSwimlaneDOM();
    const header = pool.querySelector('.ghx-swimlane-header')!;
    const swimlane = header.closest('.ghx-swimlane') as HTMLElement;

    BoardPagePageObject.highlightSwimlane(header, true);
    BoardPagePageObject.highlightSwimlane(header, false);

    expect(swimlane.style.backgroundColor).toBe('');
    expect((header as HTMLElement).style.backgroundColor).toBe('');
  });
});

describe('CardPageObject', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

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
