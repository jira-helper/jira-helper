/// <reference types="cypress" />
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { useColumnLimitsPropertyStore } from '../../property';
import { useColumnLimitsRuntimeStore, getInitialState } from '../stores';
import { columnLimitsBoardPageObjectToken } from '../pageObject';
import { ColumnLimitsBoardPageObject } from '../pageObject/ColumnLimitsBoardPageObject';

// --- Fixtures matching feature Background ---

export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
  { id: 'sw3', name: 'Excluded' },
];

export const issueTypes = [
  { id: 'type1', name: 'Bug' },
  { id: 'type2', name: 'Task' },
  { id: 'type3', name: 'Story' },
];

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
  Excluded: 'sw3',
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
export const setupBoardDOM = () => {
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
  pool.innerHTML = `
    <div class="ghx-swimlane" swimlane-id="sw1">
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>
    </div>
    <div class="ghx-swimlane" swimlane-id="sw2">
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>
    </div>
    <div class="ghx-swimlane" swimlane-id="sw3">
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>
    </div>
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

  useColumnLimitsPropertyStore.getState().actions.reset();
  useColumnLimitsRuntimeStore.setState(getInitialState());

  document.body.innerHTML = '';

  setupBoardDOM();

  globalContainer.register({
    token: columnLimitsBoardPageObjectToken,
    value: new ColumnLimitsBoardPageObject(),
  });

  useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');
};

export const cleanupAfterScenario = () => {
  document.querySelectorAll('.ghx-issue').forEach(issue => issue.remove());
  document.body.innerHTML = '';
  useColumnLimitsRuntimeStore.setState(getInitialState());
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
