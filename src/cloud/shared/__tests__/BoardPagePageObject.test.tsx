import { beforeEach, describe, expect, it } from 'vitest';

import { BoardPagePageObject } from '../BoardPagePageObject';

describe('BoardPagePageObject', () => {
  function renderColumn(): { column: HTMLElement; header: HTMLElement } {
    document.body.innerHTML = `
      <div data-testid="software-board.board-container.board">
        <div data-testid="platform-board-kit.ui.column.draggable-column">
          <div data-testid="platform-board-kit.ui.column-header">
            <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
          </div>
          <div data-testid="platform-board-kit.ui.card.card">KAN-1</div>
        </div>
      </div>
    `;

    const column = document.querySelector<HTMLElement>('[data-testid*="draggable-column"]');
    const header = document.querySelector<HTMLElement>('[data-testid="platform-board-kit.ui.column-header"]');

    if (!column || !header) {
      throw new Error('Expected test column DOM');
    }

    BoardPagePageObject.setCachedColumns([{ id: 'column-0', name: 'To Do' }]);
    return { column, header };
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    BoardPagePageObject.setCachedColumns([]);
  });

  it('resolves the per-column header instead of the whole column', () => {
    const { header } = renderColumn();

    expect(BoardPagePageObject.getColumnHeaderElement('column-0')).toBe(header);
  });

  it('inserts and removes limit badge inside the column header', () => {
    const { column, header } = renderColumn();

    BoardPagePageObject.insertColumnHeaderHtml(
      'column-0',
      '<span data-column-limits-badge="true">2/1</span>'
    );

    expect(header.querySelector('[data-column-limits-badge]')?.textContent).toBe('2/1');
    expect(column.querySelector('[data-jh-group-label]')).toBeNull();

    BoardPagePageObject.removeColumnHeaderElements('column-0', '[data-column-limits-badge]');

    expect(header.querySelector('[data-column-limits-badge]')).toBeNull();
  });

  it('styles only the column header for group decoration', () => {
    const { column, header } = renderColumn();

    BoardPagePageObject.styleColumnHeader('column-0', {
      backgroundColor: 'rgb(222, 235, 255)',
      borderTop: '4px solid rgb(255, 0, 0)',
    });

    expect(header.style.borderTop).toBe('4px solid rgb(255, 0, 0)');
    expect(column.style.borderTop).toBe('');
  });

  it('reads assignee from Jira Cloud avatar label text', () => {
    document.body.innerHTML = `
      <div data-testid="platform-board-kit.ui.card.card">
        <div data-testid="software-board.common.fields.assignee-field-static.avatar-wrapper">
          <div data-testid="board.common.fields.assignee-field-static.avatar" role="img" aria-labelledby="assignee-label">
            <span data-testid="board.common.fields.assignee-field-static.avatar--inner"></span>
            <img data-testid="board.common.fields.assignee-field-static.avatar--image" alt="" aria-hidden="true" />
            <span data-testid="board.common.fields.assignee-field-static.avatar--label" id="assignee-label" hidden>
              Исполнитель: xCredo
            </span>
          </div>
        </div>
      </div>
    `;

    const issue = document.querySelector('[data-testid="platform-board-kit.ui.card.card"]');

    expect(BoardPagePageObject.getAssigneeFromIssue(issue!)).toBe('xCredo');
  });

  it('resolves the new board.content.* Cloud board DOM', () => {
    document.body.innerHTML = `
      <div data-testid="board.content.board-wrapper">
        <div data-testid="board.content.cell">
          <div data-testid="board.content.cell.column-header">
            <div data-testid="board.content.cell.column-header.name">To Do</div>
          </div>
          <div data-testid="board.content.cell.card">KAN-1</div>
        </div>
      </div>
    `;

    expect(document.querySelector(BoardPagePageObject.selectors.pool)).toBeTruthy();
    expect(BoardPagePageObject.getColumnElements()).toHaveLength(1);
    expect(BoardPagePageObject.getOrderedColumns()[0]?.name).toBe('To Do');
    expect(BoardPagePageObject.getAllCloudCards()).toHaveLength(1);
  });

  function renderBoardContentCells() {
    document.body.innerHTML = `
      <div data-testid="board.content.board-wrapper">
        <div data-testid="board.content.cell">
          <div data-testid="board.content.cell.column-header">
            <div data-testid="board.content.cell.column-header.name">To Do</div>
          </div>
          <div data-testid="board.content.cell.card" aria-label="KAN-1">
            <span aria-label="Исполнитель: xCredo"></span>
          </div>
          <div data-testid="board.content.cell.card" aria-label="KAN-2">
            <span aria-label="Исполнитель: xCredo"></span>
          </div>
        </div>
        <div data-testid="board.content.cell">
          <div data-testid="board.content.cell.column-header">
            <div data-testid="board.content.cell.column-header.name">In Progress</div>
          </div>
          <div data-testid="board.content.cell.card" aria-label="KAN-3">
            <span aria-label="Исполнитель: Maxim"></span>
          </div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([
      { id: '10000', name: 'To Do' },
      { id: '10001', name: 'In Progress' },
    ]);
  }

  it('resolves column id from board.content.cell for person-limits matching', () => {
    renderBoardContentCells();
    const columns = BoardPagePageObject.getColumnElements();
    const todoCard = document.querySelector('[aria-label="KAN-1"]');

    expect(BoardPagePageObject.getColumnIdFromColumn(columns[0]!)).toBe('column-0');
    expect(BoardPagePageObject.getColumnIdFromColumn(columns[1]!)).toBe('column-1');
    expect(BoardPagePageObject.getColumnIdOfIssue(todoCard!)).toBe('column-0');
  });

  it('counts all cards in a board.content.cell by positional and status column ids', () => {
    renderBoardContentCells();

    expect(BoardPagePageObject.getIssueCountInColumn('column-0')).toBe(2);
    expect(BoardPagePageObject.getIssueCountInColumn('column-1')).toBe(1);
    expect(BoardPagePageObject.getIssueCountInColumn('10000')).toBe(2);
    expect(BoardPagePageObject.getIssueCountInColumn('10001')).toBe(1);
  });

  it('marks overloaded cards so assignee highlighter does not wipe the color', () => {
    renderBoardContentCells();
    const card = document.querySelector<HTMLElement>('[aria-label="KAN-1"]');

    BoardPagePageObject.setIssueBackgroundColor(card!, '#ff5630');

    expect(card!.getAttribute('data-jh-wip-overloaded')).toBe('true');
    expect(card!.classList.contains('jh-wip-overloaded')).toBe(true);
    expect(card!.style.backgroundColor).toBe('#ff5630');

    BoardPagePageObject.resetIssueBackgroundColor(card!);

    expect(card!.hasAttribute('data-jh-wip-overloaded')).toBe(false);
    expect(card!.classList.contains('jh-wip-overloaded')).toBe(false);
  });

  it('reads assignee from aria-label on board.content.cell.card', () => {
    renderBoardContentCells();
    const card = document.querySelector('[aria-label="KAN-1"]');

    expect(BoardPagePageObject.getAssigneeFromIssue(card!)).toBe('xCredo');
  });
});

