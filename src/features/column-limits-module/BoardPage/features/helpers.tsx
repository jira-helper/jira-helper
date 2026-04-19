/// <reference types="cypress" />
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, BoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { columnLimitsModule } from '../../module';
import { propertyModelToken, boardRuntimeModelToken } from '../../tokens';

// --- Fixtures matching feature Background ---

// Column name to ID mapping
export const columnNameToId: Record<string, string> = {
  'To Do': 'col1',
  'In Progress': 'col2',
  Review: 'col3',
  Done: 'col4',
};

// Swimlane name to ID mapping
export const swimlaneNameToId: Record<string, string> = {
  Frontend: 'sw1',
  Backend: 'sw2',
  Expedite: 'sw3',
};

const mockBoardPropertyService: BoardPropertyServiceI = {
  async getBoardProperty() {
    return undefined;
  },
  updateBoardProperty() {},
  deleteBoardProperty() {},
};

// --- DOM helpers ---

/**
 * Creates a mock issue element in the DOM.
 */
export const createMockIssue = (
  id: string,
  columnId: string,
  swimlaneId: string | null = null,
  issueType = 'Task'
): HTMLElement => {
  const issue = document.createElement('div');
  issue.className = 'ghx-issue';
  issue.setAttribute('data-issue-id', id);
  issue.setAttribute('data-column-id', columnId);
  if (swimlaneId) {
    issue.setAttribute('swimlane-id', swimlaneId);
  }
  const typeElement = document.createElement('div');
  typeElement.className = 'ghx-type';
  typeElement.setAttribute('title', issueType);
  issue.appendChild(typeElement);
  const textNode = document.createTextNode(`Issue ${id}`);
  issue.appendChild(textNode);
  return issue;
};

/**
 * Setup DOM structure for board page.
 */
const setupBoardDOM = () => {
  const wrapper = document.createElement('div');
  wrapper.id = 'ghx-pool-wrapper';
  wrapper.innerHTML = `
    <div class="ghx-column-header-group">
      <ul class="ghx-columns ghx-first">
        <li class="ghx-column" data-id="col1" data-column-id="col1">To Do</li>
        <li class="ghx-column" data-id="col2" data-column-id="col2">In Progress</li>
        <li class="ghx-column" data-id="col3" data-column-id="col3">Review</li>
        <li class="ghx-column" data-id="col4" data-column-id="col4">Done</li>
      </ul>
    </div>
  `;

  const pool = document.createElement('div');
  pool.id = 'ghx-pool';
  const swimlaneBody = `
      <div class="ghx-swimlane-header"></div>
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>`;
  pool.innerHTML = `
    <div class="ghx-swimlane" swimlane-id="sw1">${swimlaneBody}</div>
    <div class="ghx-swimlane" swimlane-id="sw2">${swimlaneBody}</div>
    <div class="ghx-swimlane" swimlane-id="sw3">${swimlaneBody}</div>
  `;

  document.body.appendChild(wrapper);
  document.body.appendChild(pool);

  return { wrapper, pool };
};

/**
 * Add issue to DOM.
 */
export const addIssueToDOM = (issue: HTMLElement, columnId: string, swimlaneId: string) => {
  const swimlane = document.querySelector(`.ghx-swimlane[swimlane-id="${swimlaneId}"]`);
  const column = swimlane?.querySelector(`.ghx-column[data-column-id="${columnId}"]`);
  if (column) {
    column.appendChild(issue);
  }
};

// --- Background setup ---

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);

  globalContainer.register({
    token: BoardPropertyServiceToken,
    value: mockBoardPropertyService,
  });
  globalContainer.register({
    token: boardPagePageObjectToken,
    value: BoardPagePageObject,
  });

  columnLimitsModule.ensure(globalContainer);

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });

  document.body.innerHTML = '';

  setupBoardDOM();

  globalContainer.inject(propertyModelToken).model.reset();
  globalContainer.inject(boardRuntimeModelToken).model.reset();
  globalContainer.inject(boardRuntimeModelToken).model.setCssNotIssueSubTask('');
};

// --- Issue counter for unique IDs ---

let issueCounter = 0;

export const resetIssueCounter = () => {
  issueCounter = 0;
};

export const getNextIssueId = () => {
  issueCounter += 1;
  return `issue-${issueCounter}`;
};
