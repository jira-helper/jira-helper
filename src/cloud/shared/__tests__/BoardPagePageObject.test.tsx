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
    BoardPagePageObject.setBoardWorkData(null);
    BoardPagePageObject.setSwimlanesCache(null);
  });

  it('clearRuntimeCaches drops column and swimlane caches', () => {
    BoardPagePageObject.setCachedColumns([{ id: '115', name: 'To Do' }]);
    BoardPagePageObject.setSwimlanesCache([{ id: 'sw1', name: 'Default' }]);

    BoardPagePageObject.clearRuntimeCaches?.();

    expect(BoardPagePageObject.getCachedSwimlanes?.()).toEqual([]);
    expect(BoardPagePageObject.getOrderedColumns()).toEqual([]);
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

  it('styles the sticky header wrapper so translucent Cloud overlay is opaque', () => {
    document.body.innerHTML = `
      <div data-testid="board.content.board-wrapper">
        <div data-testid="platform-board-kit.ui.column.draggable-column">
          <div data-jh-sticky-header style="position: sticky; top: 40px; background: rgba(5, 21, 36, 0.06);">
            <div data-testid="platform-board-kit.ui.column-header">
              <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
            </div>
          </div>
          <div data-testid="platform-board-kit.ui.card.card">KAN-1</div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([{ id: '115', name: 'To Do' }]);

    const sticky = document.querySelector<HTMLElement>('[data-jh-sticky-header]');
    const inner = document.querySelector<HTMLElement>('[data-testid="platform-board-kit.ui.column-header"]');

    expect(BoardPagePageObject.getColumnHeaderElement('115')).toBe(sticky);

    BoardPagePageObject.styleColumnHeader('115', {
      backgroundColor: 'rgb(255, 255, 255)',
      borderTop: '4px solid rgb(255, 0, 0)',
      paddingTop: '18px',
    });

    expect(sticky!.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(sticky!.style.borderTop).toBe('4px solid rgb(255, 0, 0)');
    expect(sticky!.style.paddingTop).toBe('18px');
    // Inner opaque Cloud header must get the same fill, otherwise sticky tint is hidden.
    expect(inner!.style.backgroundColor).toBe('rgb(255, 255, 255)');
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

  it('reads issue key from nested browse href when the overlay link has no text', () => {
    document.body.innerHTML = `
      <div data-testid="board.content.cell.card">
        <a href="/browse/KAN-4" aria-label="KAN-4 Задача. Нажмите клавишу Enter, чтобы загрузить задачу."></a>
        <a href="/browse/KAN-4">KAN-4</a>
      </div>
    `;
    const card = document.querySelector('[data-testid="board.content.cell.card"]')!;
    expect(BoardPagePageObject.getIssueKeyFromIssue(card)).toBe('KAN-4');
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

  it('resolves pool on classic software-board.board Cloud DOM', () => {
    document.body.innerHTML = `
      <div data-testid="software-board.board">
        <div data-testid="platform-board-kit.ui.card.card">TRB3-1</div>
      </div>
    `;
    expect(document.querySelector(BoardPagePageObject.selectors.pool)?.getAttribute('data-testid')).toBe(
      'software-board.board'
    );
  });

  it('reads issue type from classic Cloud issuetype icon alt text', () => {
    document.body.innerHTML = `
      <div data-testid="platform-board-kit.ui.card.card">
        <img alt="Эпик" src="https://crazymax101.atlassian.net/images/icons/issuetypes/epic.svg" />
        <img alt="Приоритет Medium" src="https://crazymax101.atlassian.net/images/icons/priorities/medium_new.svg" />
      </div>
    `;
    const card = document.querySelector('[data-testid="platform-board-kit.ui.card.card"]')!;
    expect(BoardPagePageObject.getIssueTypeFromIssue(card)).toBe('Эпик');
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
      { id: '115', name: 'To Do' },
      { id: '116', name: 'In Progress' },
    ]);
  }

  it('resolves column id from board.content.cell using editmodel cache ids', () => {
    renderBoardContentCells();
    const columns = BoardPagePageObject.getColumnElements();
    const todoCard = document.querySelector('[aria-label="KAN-1"]');

    expect(BoardPagePageObject.getColumnIdFromColumn(columns[0]!)).toBe('115');
    expect(BoardPagePageObject.getColumnIdFromColumn(columns[1]!)).toBe('116');
    expect(BoardPagePageObject.getColumnIdOfIssue(todoCard!)).toBe('115');
  });

  it('counts all cards in a board.content.cell by positional and column ids', () => {
    renderBoardContentCells();

    expect(BoardPagePageObject.getIssueCountInColumn('column-0')).toBe(2);
    expect(BoardPagePageObject.getIssueCountInColumn('column-1')).toBe(1);
    expect(BoardPagePageObject.getIssueCountInColumn('115')).toBe(2);
    expect(BoardPagePageObject.getIssueCountInColumn('116')).toBe(1);
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

  function renderAssigneeSwimlanes() {
    document.body.innerHTML = `
      <div data-testid="board.content.board-wrapper" role="list">
        <div role="listitem">
          <button type="button">Свернуть группу «Maxim Sosnov»</button>
          <div data-testid="board.content.swimlane.scroll-container">
            <div data-testid="board.content.cell">
              <div data-testid="board.content.cell.column-header">
                <div data-testid="board.content.cell.column-header.name">To Do</div>
              </div>
              <div data-testid="board.content.cell.card" aria-label="KAN-M1"></div>
            </div>
            <div data-testid="board.content.cell">
              <div data-testid="board.content.cell.column-header">
                <div data-testid="board.content.cell.column-header.name">In Progress</div>
              </div>
            </div>
          </div>
        </div>
        <div role="listitem">
          <button type="button">Свернуть группу «xCredo»</button>
          <div data-testid="board.content.swimlane.scroll-container">
            <div data-testid="board.content.cell">
              <div data-testid="board.content.cell.column-header">
                <div data-testid="board.content.cell.column-header.name">To Do</div>
              </div>
              <div data-testid="board.content.cell.card" aria-label="KAN-X1"></div>
              <div data-testid="board.content.cell.card" aria-label="KAN-X2"></div>
            </div>
            <div data-testid="board.content.cell">
              <div data-testid="board.content.cell.column-header">
                <div data-testid="board.content.cell.column-header.name">In Progress</div>
              </div>
              <div data-testid="board.content.cell.card" aria-label="KAN-X3"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([
      { id: '115', name: 'To Do' },
      { id: '116', name: 'In Progress' },
    ]);
  }

  it('discovers Cloud Group-by swimlanes from board.content.swimlane.scroll-container', () => {
    renderAssigneeSwimlanes();

    const swimlanes = BoardPagePageObject.getSwimlanes();
    expect(swimlanes).toHaveLength(2);
    expect(BoardPagePageObject.getSwimlaneIds()).toEqual(['swimlane-0', 'swimlane-1']);
    expect(swimlanes[0]?.header.textContent).toContain('Maxim Sosnov');
    expect(BoardPagePageObject.getColumnsInSwimlane(swimlanes[0]!.element)).toHaveLength(2);
  });

  it('countIssueVisibility does not treat comma Cloud card selectors as all-hidden', () => {
    renderAssigneeSwimlanes();
    const maxim = BoardPagePageObject.getSwimlanes()[0]!.element;
    const selector = BoardPagePageObject.selectors.issue;

    expect(BoardPagePageObject.countIssueVisibility(maxim, selector)).toEqual({ total: 1, hidden: 0 });

    document.querySelector('[aria-label="KAN-M1"]')!.classList.add('no-visibility');
    expect(BoardPagePageObject.countIssueVisibility(maxim, selector)).toEqual({ total: 1, hidden: 1 });
  });

  it('counts column WIP across all assignee swimlane cells (not only the first row)', () => {
    renderAssigneeSwimlanes();

    // Maxim To Do (1) + xCredo To Do (2) = 3; In Progress: 0 + 1 = 1
    expect(BoardPagePageObject.getIssueCountInColumn('column-0')).toBe(3);
    expect(BoardPagePageObject.getIssueCountInColumn('column-1')).toBe(1);
    expect(BoardPagePageObject.getIssueCountInColumn('115')).toBe(3);
    expect(BoardPagePageObject.getOrderedColumnIds()).toEqual(['115', '116']);
  });

  it('resolves editmodel cache ids inside each swimlane for person-limits', () => {
    renderAssigneeSwimlanes();
    const swimlanes = BoardPagePageObject.getSwimlanes();
    const maximTodo = BoardPagePageObject.getColumnsInSwimlane(swimlanes[0]!.element)[0]!;
    const xcredoTodo = BoardPagePageObject.getColumnsInSwimlane(swimlanes[1]!.element)[0]!;
    const xcredoCard = document.querySelector('[aria-label="KAN-X1"]');

    expect(BoardPagePageObject.getColumnIdFromColumn(maximTodo)).toBe('115');
    expect(BoardPagePageObject.getColumnIdFromColumn(xcredoTodo)).toBe('115');
    expect(BoardPagePageObject.getColumnIdOfIssue(xcredoCard!)).toBe('115');
    expect(BoardPagePageObject.getSwimlaneIdOfIssue(xcredoCard!)).toBe('swimlane-1');
  });

  it('keeps column-N aliases for counts when editmodel cache ids are present', () => {
    renderBoardContentCells();

    expect(BoardPagePageObject.getIssueCountInColumn('column-0')).toBe(2);
    expect(BoardPagePageObject.getIssueCountInColumn('115')).toBe(2);
    expect(BoardPagePageObject.getIssueCountInColumn('column-1')).toBe(1);
    expect(BoardPagePageObject.getIssueCountInColumn('116')).toBe(1);
  });

  function renderCompanyManagedSwimlanes() {
    // Classic company-managed swimlanes use platform-board-kit.ui.swimlane.*,
    // not board.content.swimlane.scroll-container (team-managed Group-by).
    document.body.innerHTML = `
      <div data-testid="software-board.board-area">
        <div data-testid="platform-board-kit.ui.swimlane.swimlane-wrapper">
          <div data-testid="platform-board-kit.ui.swimlane.summary-section">Expedite</div>
          <div data-testid="platform-board-kit.ui.swimlane.swimlane-columns">
            <div data-testid="platform-board-kit.ui.column.draggable-column">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
              </div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-1"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-2"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-3"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-4"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-5"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-6"></div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">In Progress</div>
              </div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">Done</div>
              </div>
            </div>
          </div>
        </div>
        <div data-testid="platform-board-kit.ui.swimlane.swimlane-wrapper">
          <div data-testid="platform-board-kit.ui.swimlane.summary-section">Everything Else</div>
          <div data-testid="platform-board-kit.ui.swimlane.swimlane-columns">
            <div data-testid="platform-board-kit.ui.column.draggable-column">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
              </div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-7"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-8"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-9"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-10"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-11"></div>
              <div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-12"></div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">In Progress</div>
              </div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([
      { id: '115', name: 'To Do' },
      { id: '116', name: 'In Progress' },
      { id: '117', name: 'Done' },
    ]);
  }

  it('counts WIP across company-managed Cloud swimlanes (swimlane-columns)', () => {
    renderCompanyManagedSwimlanes();

    const swimlanes = BoardPagePageObject.getSwimlanes();
    expect(swimlanes).toHaveLength(2);
    expect(swimlanes[0]?.header.textContent).toContain('Expedite');
    expect(swimlanes[1]?.header.textContent).toContain('Everything Else');
    expect(BoardPagePageObject.hasCustomSwimlanes()).toBe(true);

    expect(BoardPagePageObject.getColumnElements()).toHaveLength(6);
    expect(BoardPagePageObject.getIssueCountInColumn('115')).toBe(12);
    expect(BoardPagePageObject.getIssueCountInColumn('column-0')).toBe(12);
    expect(BoardPagePageObject.getIssueCountInColumn('116')).toBe(0);

    const secondTodo = BoardPagePageObject.getColumnsInSwimlane(swimlanes[1]!.element)[0]!;
    const lateCard = document.querySelector('[aria-label="TRB3-12"]');
    expect(BoardPagePageObject.getColumnIdFromColumn(secondTodo)).toBe('115');
    expect(BoardPagePageObject.getColumnIdOfIssue(lateCard!)).toBe('115');
    expect(BoardPagePageObject.getSwimlaneIdOfIssue(lateCard!)).toBe('swimlane-1');
  });

  it('highlights every swimlane cell for an over-limit column', () => {
    renderAssigneeSwimlanes();
    BoardPagePageObject.highlightColumnCells('115', 'rgb(255, 86, 48)');

    const todoCells = BoardPagePageObject.getSwimlanes().flatMap(sw =>
      BoardPagePageObject.getColumnsInSwimlane(sw.element).filter(
        col => BoardPagePageObject.getColumnIdFromColumn(col) === '115'
      )
    );
    expect(todoCells).toHaveLength(2);
    todoCells.forEach(cell => {
      expect((cell as HTMLElement).style.backgroundColor).toBe('rgb(255, 86, 48)');
    });
  });

  it('paints the nested Cloud column surface two descendants below the wrapper', () => {
    document.body.innerHTML = `
      <div data-testid="software-board.board">
        <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
          <div>
            <div data-jh-column-surface="true">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
              </div>
              <ul data-testid="software-board.board-container.board.virtual-board.fast-virtual-list.fast-virtual-list-wrapper">
                <li><div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-1"></div></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([{ id: '115', name: 'To Do' }]);

    BoardPagePageObject.highlightColumnCells('115', 'rgb(222, 53, 11)');

    const wrapper = document.querySelector<HTMLElement>(
      '[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"]'
    );
    const surface = document.querySelector<HTMLElement>('[data-jh-column-surface]');
    expect(wrapper?.style.backgroundColor).toBe('');
    expect(surface?.style.backgroundColor).toBe('rgb(222, 53, 11)');
    expect(document.querySelector<HTMLElement>('[data-testid*="fast-virtual-list-wrapper"]')?.style.backgroundColor).toBe(
      'rgb(222, 53, 11)'
    );

    BoardPagePageObject.resetColumnCellStyles('115');

    expect(surface?.style.backgroundColor).toBe('');
  });

  it('clears leftover over-limit paint on both the wrapper and nested surface', () => {
    document.body.innerHTML = `
      <div data-testid="software-board.board">
        <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper" style="background-color: rgb(255, 86, 48);">
          <div>
            <div data-jh-column-surface="true" style="background-color: rgb(222, 53, 11);">
              <div data-testid="platform-board-kit.ui.column-header">
                <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([{ id: '115', name: 'To Do' }]);

    BoardPagePageObject.resetColumnCellStyles('115');

    const wrapper = document.querySelector<HTMLElement>(
      '[data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper"]'
    );
    const surface = document.querySelector<HTMLElement>('[data-jh-column-surface]');
    expect(wrapper?.style.backgroundColor).toBe('');
    expect(surface?.style.backgroundColor).toBe('');
  });

  function renderPartialCompanyManagedSwimlanes() {
    // Only 2 of 3 swimlanes mounted (vertical virtualization) — DOM count would be 13, not 19.
    document.body.innerHTML = `
      <div data-testid="software-board.board-area">
        <div data-testid="platform-board-kit.ui.swimlane.swimlane-wrapper">
          <div data-testid="platform-board-kit.ui.swimlane.summary-section">Expedite</div>
          <div data-testid="platform-board-kit.ui.swimlane.swimlane-columns">
            <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
              <div data-testid="platform-board-kit.ui.column.draggable-column">
                <div data-testid="platform-board-kit.ui.column-header">
                  <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
                </div>
                ${Array.from({ length: 6 }, (_, i) => `<div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-E${i + 1}"></div>`).join('')}
              </div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
              <div data-testid="platform-board-kit.ui.column.draggable-column">
                <div data-testid="platform-board-kit.ui.column-header">
                  <div data-testid="platform-board-kit.ui.column-header-content">In Progress</div>
                </div>
              </div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
              <div data-testid="platform-board-kit.ui.column.draggable-column">
                <div data-testid="platform-board-kit.ui.column-header">
                  <div data-testid="platform-board-kit.ui.column-header-content">Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div data-testid="platform-board-kit.ui.swimlane.swimlane-wrapper">
          <div data-testid="platform-board-kit.ui.swimlane.summary-section">Everything Else</div>
          <div data-testid="platform-board-kit.ui.swimlane.swimlane-columns">
            <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
              <div data-testid="platform-board-kit.ui.column.draggable-column">
                <div data-testid="platform-board-kit.ui.column-header">
                  <div data-testid="platform-board-kit.ui.column-header-content">To Do</div>
                </div>
                ${Array.from({ length: 4 }, (_, i) => `<div data-testid="platform-board-kit.ui.card.card" aria-label="TRB3-EE${i + 1}"></div>`).join('')}
              </div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
              <div data-testid="platform-board-kit.ui.column.draggable-column">
                <div data-testid="platform-board-kit.ui.column-header">
                  <div data-testid="platform-board-kit.ui.column-header-content">In Progress</div>
                </div>
              </div>
            </div>
            <div data-testid="platform-board-kit.ui.column.draggable-column.styled-wrapper">
              <div data-testid="platform-board-kit.ui.column.draggable-column">
                <div data-testid="platform-board-kit.ui.column-header">
                  <div data-testid="platform-board-kit.ui.column-header-content">Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    BoardPagePageObject.setCachedColumns([
      { id: '115', name: 'To Do', statusIds: ['10074'] },
      { id: '116', name: 'In Progress', statusIds: ['10075'] },
      { id: '117', name: 'Done', statusIds: ['10076'] },
    ]);
  }

  function setTrb3WorkData() {
    const priIssues = Array.from({ length: 9 }, (_, i) => ({
      id: 1000 + i,
      statusId: '10074',
      typeName: 'Story',
    }));
    const expediteIssues = Array.from({ length: 6 }, (_, i) => ({
      id: 2000 + i,
      statusId: '10074',
      typeName: 'Story',
    }));
    const everythingElseIssues = Array.from({ length: 4 }, (_, i) => ({
      id: 3000 + i,
      statusId: '10074',
      typeName: 'Story',
    }));

    BoardPagePageObject.setBoardWorkData({
      columns: [
        { id: '115', name: 'To Do', statusIds: ['10074'] },
        { id: '116', name: 'In Progress', statusIds: ['10075'] },
        { id: '117', name: 'Done', statusIds: ['10076'] },
      ],
      swimlanes: [
        { id: '9', name: 'pri', issueIds: priIssues.map(i => i.id) },
        { id: '6', name: 'Expedite', issueIds: expediteIssues.map(i => i.id) },
        { id: '2', name: 'Everything Else', issueIds: everythingElseIssues.map(i => i.id) },
      ],
      issues: [...priIssues, ...expediteIssues, ...everythingElseIssues],
    });
    BoardPagePageObject.setSwimlanesCache([
      { id: '9', name: 'pri' },
      { id: '6', name: 'Expedite' },
      { id: '2', name: 'Everything Else' },
    ]);
  }

  it('counts column WIP from allData even when DOM mounts fewer swimlanes', () => {
    renderPartialCompanyManagedSwimlanes();
    setTrb3WorkData();

    // DOM-only count: 6 + 4 = 10 (missing unmounted pri swimlane)
    expect(BoardPagePageObject.getIssueCountInColumn('115', { ignoredSwimlanes: ['9'] })).toBe(10);

    expect(BoardPagePageObject.getIssueCountInColumn('115')).toBe(19);
    expect(BoardPagePageObject.getIssueCountInColumn('column-0')).toBe(19);
  });

  it('matches person WIP from allData including issues not mounted in DOM', () => {
    renderPartialCompanyManagedSwimlanes();
    BoardPagePageObject.setBoardWorkData({
      columns: [
        { id: '115', name: 'To Do', statusIds: ['10074'] },
        { id: '116', name: 'In Progress', statusIds: ['10075'] },
      ],
      swimlanes: [
        { id: '1', name: 'Expedite', issueIds: [101, 102] },
        { id: '2', name: 'Everything Else', issueIds: [103] },
      ],
      issues: [
        {
          id: 101,
          key: 'TRB3-7',
          statusId: '10074',
          typeName: 'Эпик',
          assigneeAccountId: 'acct-maxim',
          assigneeName: 'Maxim Sosnov',
        },
        {
          id: 102,
          key: 'TRB3-8',
          statusId: '10074',
          typeName: 'Эпик',
          assigneeAccountId: 'acct-maxim',
          assigneeName: 'Maxim Sosnov',
        },
        {
          id: 103,
          key: 'TRB3-1',
          statusId: '10074',
          typeName: 'Эпик',
          assigneeAccountId: 'acct-maxim',
          assigneeName: 'Maxim Sosnov',
        },
        {
          id: 104,
          key: 'TRB3-99',
          statusId: '10074',
          typeName: 'Задача',
          assigneeAccountId: 'acct-maxim',
          assigneeName: 'Maxim Sosnov',
        },
      ],
    });

    const matches = BoardPagePageObject.getPersonWipMatchesFromWorkData({
      persons: [{ name: 'acct-maxim', displayName: 'Maxim Sosnov' }],
      columns: [],
      swimlanes: [{ id: '1', name: 'Expedite' }],
      includedIssueTypes: ['Эпик'],
    });

    expect(matches).toEqual([
      { key: 'TRB3-7', assignee: 'acct-maxim' },
      { key: 'TRB3-8', assignee: 'acct-maxim' },
    ]);
  });

  it('filters API column count by ignoredSwimlanes ids', () => {
    renderPartialCompanyManagedSwimlanes();
    setTrb3WorkData();

    // Ignore Everything Else (id 2): 19 - 4 = 15
    expect(BoardPagePageObject.getIssueCountInColumn('115', { ignoredSwimlanes: ['2'] })).toBe(15);
  });

  it('returns API swimlane ids from cache (not swimlane-N aliases)', () => {
    renderPartialCompanyManagedSwimlanes();
    setTrb3WorkData();

    expect(BoardPagePageObject.getSwimlaneIds()).toEqual(['9', '6', '2']);
  });

  it('maps DOM-mounted swimlanes to API ids by summary name', () => {
    renderPartialCompanyManagedSwimlanes();
    setTrb3WorkData();

    const swimlanes = BoardPagePageObject.getSwimlanes();
    expect(swimlanes).toHaveLength(2);
    expect(swimlanes[0]?.id).toBe('6');
    expect(swimlanes[1]?.id).toBe('2');

    const card = document.querySelector('[aria-label="TRB3-EE1"]');
    expect(BoardPagePageObject.getSwimlaneIdOfIssue(card!)).toBe('2');
  });

  it('styleColumnHeader skips excluded swimlane ids on company-managed boards', () => {
    renderCompanyManagedSwimlanes();
    BoardPagePageObject.setSwimlanesCache([
      { id: '6', name: 'Expedite' },
      { id: '2', name: 'Everything Else' },
    ]);

    BoardPagePageObject.styleColumnHeader('115', { borderTop: '4px solid rgb(255, 0, 0)' }, ['2']);

    const todoHeaders = BoardPagePageObject.getSwimlanes().flatMap(sw =>
      BoardPagePageObject.getColumnsInSwimlane(sw.element)
        .filter(col => BoardPagePageObject.getColumnIdFromColumn(col) === '115')
        .map(
          col =>
            col.querySelector<HTMLElement>('[data-testid="platform-board-kit.ui.column-header"]') ??
            col.querySelector<HTMLElement>('h2, h3')
        )
    );

    expect(todoHeaders).toHaveLength(2);
    expect(todoHeaders[0]!.style.borderTop).toBe('4px solid rgb(255, 0, 0)');
    expect(todoHeaders[1]!.style.borderTop).toBe('');
  });

  it('applies column header styles and badges to every mounted swimlane copy', () => {
    renderCompanyManagedSwimlanes();
    BoardPagePageObject.setSwimlanesCache([
      { id: '6', name: 'Expedite' },
      { id: '2', name: 'Everything Else' },
    ]);

    BoardPagePageObject.styleColumnHeader('115', { borderTop: '4px solid rgb(255, 0, 0)' });
    BoardPagePageObject.insertColumnHeaderHtml('115', '<span data-column-limits-badge="true">12/5</span>');

    const todoHeaders = BoardPagePageObject.getSwimlanes().flatMap(sw =>
      BoardPagePageObject.getColumnsInSwimlane(sw.element)
        .filter(col => BoardPagePageObject.getColumnIdFromColumn(col) === '115')
        .map(
          col =>
            col.querySelector<HTMLElement>('[data-testid="platform-board-kit.ui.column-header"]') ??
            col.querySelector<HTMLElement>('h2, h3')
        )
    );

    expect(todoHeaders).toHaveLength(2);
    todoHeaders.forEach(header => {
      expect(header!.style.borderTop).toBe('4px solid rgb(255, 0, 0)');
      expect(header!.querySelector('[data-column-limits-badge]')?.textContent).toBe('12/5');
    });

    BoardPagePageObject.removeColumnHeaderElements('115', '[data-column-limits-badge]');
    todoHeaders.forEach(header => {
      expect(header!.querySelector('[data-column-limits-badge]')).toBeNull();
    });
  });

  it('returns three unique columns per company-managed swimlane (no nested double-match)', () => {
    renderCompanyManagedSwimlanes();

    BoardPagePageObject.getSwimlanes().forEach(sw => {
      expect(BoardPagePageObject.getColumnsInSwimlane(sw.element)).toHaveLength(3);
    });
    expect(BoardPagePageObject.getColumnElements()).toHaveLength(6);
  });
});

