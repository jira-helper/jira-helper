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

describe('BoardPagePageObject column header & column-limits DOM helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const mountOrderedColumnsStructure = (variant: 'wrapper-first' | 'ul-first-class') => {
    if (variant === 'wrapper-first') {
      document.body.innerHTML = `
        <div class="ghx-first">
          <ul class="ghx-columns">
            <li class="ghx-column" data-column-id="c1" data-id="c1"></li>
            <li class="ghx-column" data-column-id="c2" data-id="c2"></li>
          </ul>
        </div>
      `;
    } else {
      document.body.innerHTML = `
        <ul class="ghx-columns ghx-first">
          <li class="ghx-column" data-column-id="c1" data-id="c1"></li>
          <li class="ghx-column" data-column-id="c2" data-id="c2"></li>
        </ul>
      `;
    }
  };

  it('getOrderedColumnIds reads column ids from .ghx-first ul.ghx-columns layout', () => {
    mountOrderedColumnsStructure('wrapper-first');
    expect(BoardPagePageObject.getOrderedColumnIds()).toEqual(['c1', 'c2']);
  });

  it('getOrderedColumnIds reads column ids from ul.ghx-columns.ghx-first layout', () => {
    mountOrderedColumnsStructure('ul-first-class');
    expect(BoardPagePageObject.getOrderedColumnIds()).toEqual(['c1', 'c2']);
  });

  it('getOrderedColumns returns empty list when no ordered columns', () => {
    document.body.innerHTML = '';
    expect(BoardPagePageObject.getOrderedColumns()).toEqual([]);
  });

  it('getOrderedColumns returns id and name from .ghx-column-title in getOrderedColumnIds order', () => {
    document.body.innerHTML = `
      <div class="ghx-first">
        <ul class="ghx-columns">
          <li class="ghx-column" data-column-id="c1" data-id="c1"><span class="ghx-column-title">Alpha</span></li>
          <li class="ghx-column" data-column-id="c2" data-id="c2"><span class="ghx-column-title">Beta</span></li>
        </ul>
      </div>
    `;
    const columns = BoardPagePageObject.getOrderedColumns();
    expect(columns.map(c => c.id)).toEqual(BoardPagePageObject.getOrderedColumnIds());
    expect(columns).toEqual([
      { id: 'c1', name: 'Alpha' },
      { id: 'c2', name: 'Beta' },
    ]);
  });

  it('getOrderedColumns falls back to h2 when .ghx-column-title is absent', () => {
    document.body.innerHTML = `
      <div class="ghx-first">
        <ul class="ghx-columns">
          <li class="ghx-column" data-column-id="c1" data-id="c1"><h2>From H2</h2></li>
        </ul>
      </div>
    `;
    expect(BoardPagePageObject.getOrderedColumns()).toEqual([{ id: 'c1', name: 'From H2' }]);
  });

  it('getOrderedColumns uses empty name when header has no title', () => {
    document.body.innerHTML = `
      <div class="ghx-first">
        <ul class="ghx-columns">
          <li class="ghx-column" data-column-id="cx" data-id="cx"></li>
        </ul>
      </div>
    `;
    expect(BoardPagePageObject.getOrderedColumns()).toEqual([{ id: 'cx', name: '' }]);
  });

  it('getColumnHeaderElement returns header li from ul.ghx-columns', () => {
    document.body.innerHTML = `
      <div id="ghx-column-headers">
        <ul class="ghx-columns">
          <li class="ghx-column" data-id="col-x" data-column-id="col-x"><span class="ghx-column-title">X</span></li>
        </ul>
      </div>
    `;
    const el = BoardPagePageObject.getColumnHeaderElement('col-x');
    expect(el).not.toBeNull();
    expect(el?.classList.contains('ghx-column')).toBe(true);
    expect(el?.querySelector('.ghx-column-title')?.textContent).toBe('X');
  });

  it('getColumnHeaderElement prefers ghx-column-header-group when present', () => {
    document.body.innerHTML = `
      <div class="ghx-column-header-group">
        <div class="ghx-column" data-id="col-h" data-column-id="col-h">Header group</div>
      </div>
      <ul class="ghx-columns">
        <li class="ghx-column" data-id="col-h" data-column-id="col-h">Other</li>
      </ul>
    `;
    const el = BoardPagePageObject.getColumnHeaderElement('col-h');
    expect(el?.textContent?.trim()).toBe('Header group');
  });

  it('getSwimlaneIds matches getSwimlanes ids', () => {
    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="a"><div class="ghx-swimlane-header"></div><div class="ghx-columns"></div></div>
      <div class="ghx-swimlane" swimlane-id="b"><div class="ghx-swimlane-header"></div><div class="ghx-columns"></div></div>
    `;
    document.body.appendChild(pool);

    expect(BoardPagePageObject.getSwimlaneIds()).toEqual(['a', 'b']);
    expect(BoardPagePageObject.getSwimlaneIds()).toEqual(BoardPagePageObject.getSwimlanes().map(s => s.id));
  });

  it('getIssueCountInColumn counts non-done issues across swimlanes', () => {
    document.body.innerHTML = '';
    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="s1">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue"></div>
            <div class="ghx-issue ghx-done"></div>
          </div>
        </div>
      </div>
      <div class="ghx-swimlane" swimlane-id="s2">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(pool);

    expect(BoardPagePageObject.getIssueCountInColumn('col1')).toBe(2);
  });

  it('getIssueCountInColumn ignores listed swimlanes', () => {
    document.body.innerHTML = '';
    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="s1">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1"><div class="ghx-issue"></div></div>
        </div>
      </div>
      <div class="ghx-swimlane" swimlane-id="s2">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1"><div class="ghx-issue"></div></div>
        </div>
      </div>
    `;
    document.body.appendChild(pool);

    expect(BoardPagePageObject.getIssueCountInColumn('col1', { ignoredSwimlanes: ['s1'] })).toBe(1);
  });

  it('getIssueCountInColumn applies cssFilter', () => {
    document.body.innerHTML = '';
    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="s1">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue"></div>
            <div class="ghx-issue ghx-issue-subtask"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(pool);

    expect(BoardPagePageObject.getIssueCountInColumn('col1', { cssFilter: ':not(.ghx-issue-subtask)' })).toBe(1);
  });

  it('getIssueCountInColumn filters by issue type from .ghx-type title', () => {
    document.body.innerHTML = '';
    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="s1">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue"><span class="ghx-type" title="Story"></span></div>
            <div class="ghx-issue"><span class="ghx-type" title="Simple Bug"></span></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(pool);

    expect(BoardPagePageObject.getIssueCountInColumn('col1', { includedIssueTypes: ['Story'] })).toBe(1);
  });

  it('styleColumnHeader applies inline styles to header element', () => {
    document.body.innerHTML = `
      <ul class="ghx-columns">
        <li class="ghx-column" data-id="z1" data-column-id="z1"></li>
      </ul>
    `;
    BoardPagePageObject.styleColumnHeader('z1', { color: 'red' });
    const el = BoardPagePageObject.getColumnHeaderElement('z1');
    expect(el?.style.color).toBe('red');
  });

  it('resetColumnHeaderStyles clears group header decoration set by styleColumnHeader', () => {
    document.body.innerHTML = `
      <ul class="ghx-columns">
        <li class="ghx-column" data-id="z1" data-column-id="z1"></li>
      </ul>
    `;
    BoardPagePageObject.styleColumnHeader('z1', {
      backgroundColor: '#deebff',
      borderTop: '4px solid #abc',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
    });
    BoardPagePageObject.resetColumnHeaderStyles('z1');
    const el = BoardPagePageObject.getColumnHeaderElement('z1');
    expect(el?.style.backgroundColor).toBe('');
    expect(el?.style.borderTop).toBe('');
    expect(el?.style.borderTopLeftRadius).toBe('');
    expect(el?.style.borderTopRightRadius).toBe('');
  });

  it('insertColumnHeaderHtml and removeColumnHeaderElements mutate header', () => {
    document.body.innerHTML = `
      <ul class="ghx-columns">
        <li class="ghx-column" data-id="z2" data-column-id="z2"></li>
      </ul>
    `;
    BoardPagePageObject.insertColumnHeaderHtml('z2', '<span class="badge-test" data-x="1">Hi</span>');
    const header = BoardPagePageObject.getColumnHeaderElement('z2');
    expect(header?.querySelector('.badge-test')?.textContent).toBe('Hi');

    BoardPagePageObject.removeColumnHeaderElements('z2', '.badge-test');
    expect(header?.querySelector('.badge-test')).toBeNull();
  });

  it('highlightColumnCells and resetColumnCellStyles update swimlane column cells', () => {
    document.body.innerHTML = '';
    const pool = document.createElement('div');
    pool.id = 'ghx-pool';
    pool.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="s1">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1"></div>
        </div>
      </div>
      <div class="ghx-swimlane" swimlane-id="s2">
        <div class="ghx-swimlane-header"></div>
        <div class="ghx-columns">
          <div class="ghx-column" data-column-id="col1"></div>
        </div>
      </div>
    `;
    document.body.appendChild(pool);

    BoardPagePageObject.highlightColumnCells('col1', '#ff5630', ['s2']);
    const cells = document.querySelectorAll('.ghx-column[data-column-id="col1"]');
    expect((cells[0] as HTMLElement).style.backgroundColor).toBe('#ff5630');
    expect((cells[1] as HTMLElement).style.backgroundColor).toBe('');

    BoardPagePageObject.resetColumnCellStyles('col1');
    expect((cells[0] as HTMLElement).style.backgroundColor).toBe('');
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

describe('BoardPagePageObject person-limits DOM helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('getIssueElements returns all elements for selector', () => {
    const a = document.createElement('div');
    a.className = 'custom-issue';
    document.body.appendChild(a);
    expect(BoardPagePageObject.getIssueElements('.custom-issue')).toEqual([a]);
  });

  it('getIssueElementsInColumn returns issues scoped to the column element', () => {
    const col = document.createElement('div');
    col.className = 'ghx-column';
    const inCol = document.createElement('div');
    inCol.className = 'ghx-issue';
    const other = document.createElement('div');
    other.className = 'ghx-issue';
    col.appendChild(inCol);
    document.body.appendChild(col);
    document.body.appendChild(other);
    expect(BoardPagePageObject.getIssueElementsInColumn(col, '.ghx-issue')).toEqual([inCol]);
  });

  it('getAssigneeFromIssue parses avatar alt via getNameFromTooltip', () => {
    const issue = document.createElement('div');
    const img = document.createElement('img');
    img.className = 'ghx-avatar-img';
    img.setAttribute('alt', 'Assignee: Jane [x]');
    issue.appendChild(img);
    expect(BoardPagePageObject.getAssigneeFromIssue(issue)).toBe('Jane');
  });

  it('getIssueTypeFromIssue returns title or text (full string, not split)', () => {
    const issue = document.createElement('div');
    const typeEl = document.createElement('span');
    typeEl.className = 'ghx-type';
    typeEl.setAttribute('title', 'Type: Story');
    issue.appendChild(typeEl);
    expect(BoardPagePageObject.getIssueTypeFromIssue(issue)).toBe('Type: Story');
    typeEl.removeAttribute('title');
    typeEl.textContent = 'Bug';
    expect(BoardPagePageObject.getIssueTypeFromIssue(issue)).toBe('Bug');
  });

  it('getColumnIdOfIssue, getColumnIdFromColumn, getSwimlaneIdOfIssue read from ancestors', () => {
    const swimlane = document.createElement('div');
    swimlane.className = 'ghx-swimlane';
    swimlane.setAttribute('swimlane-id', 'sw-a');
    const col = document.createElement('div');
    col.className = 'ghx-column';
    col.setAttribute('data-column-id', 'col-x');
    const issue = document.createElement('div');
    col.appendChild(issue);
    swimlane.appendChild(col);
    document.body.appendChild(swimlane);

    expect(BoardPagePageObject.getColumnIdOfIssue(issue)).toBe('col-x');
    expect(BoardPagePageObject.getColumnIdFromColumn(col)).toBe('col-x');
    expect(BoardPagePageObject.getSwimlaneIdOfIssue(issue)).toBe('sw-a');
  });

  it('hasCustomSwimlanes is true when swimlane header aria-label mentions custom', () => {
    const h = document.createElement('div');
    h.className = 'ghx-swimlane-header';
    h.setAttribute('aria-label', 'custom swimlane');
    document.body.appendChild(h);
    expect(BoardPagePageObject.hasCustomSwimlanes()).toBe(true);
  });

  it('hasCustomSwimlanes is false when no header', () => {
    expect(BoardPagePageObject.hasCustomSwimlanes()).toBe(false);
  });

  it('getColumnElements and getColumnsInSwimlane return column elements', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="s">
        <div class="ghx-column" data-column-id="c1"></div>
        <div class="ghx-column" data-column-id="c2"></div>
      </div>
      <div class="ghx-column" data-column-id="orphan"></div>
    `;
    const swimlane = document.querySelector('.ghx-swimlane')!;
    const colsInSwim = BoardPagePageObject.getColumnsInSwimlane(swimlane);
    expect(colsInSwim).toHaveLength(2);
    const allCols = BoardPagePageObject.getColumnElements();
    expect(allCols).toHaveLength(3);
  });

  it('getParentGroups queries parent group selector', () => {
    const g = document.createElement('div');
    g.className = 'ghx-parent-group';
    document.body.appendChild(g);
    expect(BoardPagePageObject.getParentGroups()).toEqual([g]);
  });

  it('countIssueVisibility counts hidden with no-visibility class', () => {
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="ghx-issue"></div><div class="ghx-issue no-visibility"></div><div class="ghx-issue no-visibility"></div>';
    document.body.appendChild(wrap);
    expect(BoardPagePageObject.countIssueVisibility(wrap, '.ghx-issue')).toEqual({ total: 3, hidden: 2 });
  });

  it('setIssueVisibility and background color helpers mutate issue element', () => {
    const issue = document.createElement('div');
    BoardPagePageObject.setIssueBackgroundColor(issue, 'red');
    expect((issue as HTMLElement).style.backgroundColor).toBe('red');
    BoardPagePageObject.resetIssueBackgroundColor(issue);
    expect((issue as HTMLElement).style.backgroundColor).toBe('');

    BoardPagePageObject.setIssueVisibility(issue, false);
    expect(issue.classList.contains('no-visibility')).toBe(true);
    BoardPagePageObject.setIssueVisibility(issue, true);
    expect(issue.classList.contains('no-visibility')).toBe(false);
  });

  it('setSwimlaneVisibility and setParentGroupVisibility toggle no-visibility', () => {
    const swimlane = document.createElement('div');
    const group = document.createElement('div');
    BoardPagePageObject.setSwimlaneVisibility(swimlane, false);
    expect(swimlane.classList.contains('no-visibility')).toBe(true);
    BoardPagePageObject.setSwimlaneVisibility(swimlane, true);
    expect(swimlane.classList.contains('no-visibility')).toBe(false);

    BoardPagePageObject.setParentGroupVisibility(group, false);
    expect(group.classList.contains('no-visibility')).toBe(true);
    BoardPagePageObject.setParentGroupVisibility(group, true);
    expect(group.classList.contains('no-visibility')).toBe(false);
  });
});
