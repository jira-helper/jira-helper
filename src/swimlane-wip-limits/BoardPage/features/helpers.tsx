/// <reference types="cypress" />
import { BoardRuntimeModel } from '../models/BoardRuntimeModel';
import { BoardPagePageObject, type IBoardPagePageObject } from 'src/page-objects/BoardPage';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/shared/Logger';
import type { SwimlaneSettings } from '../../types';

export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
];

export const columnNameToId: Record<string, string> = {
  'To Do': 'col1',
  'In Progress': 'col2',
  Done: 'col3',
};

let issueCounter = 0;

export const resetIssueCounter = () => {
  issueCounter = 0;
};

export const getNextIssueId = () => {
  issueCounter += 1;
  return `issue-${issueCounter}`;
};

export const createMockIssue = (id: string, issueType = 'Task'): HTMLElement => {
  const issue = document.createElement('div');
  issue.className = 'ghx-issue';
  issue.setAttribute('data-issue-id', id);

  const typeElement = document.createElement('div');
  typeElement.className = 'ghx-type';
  typeElement.setAttribute('title', issueType);
  issue.appendChild(typeElement);

  return issue;
};

export const addIssueToDOM = (issue: HTMLElement, columnId: string, swimlaneId: string) => {
  const swimlane = document.querySelector(`.ghx-swimlane[swimlane-id="${swimlaneId}"]`);
  const column = swimlane?.querySelector(`.ghx-column[data-column-id="${columnId}"]`);
  column?.appendChild(issue);
};

const setupBoardDOM = () => {
  document.body.innerHTML = '';

  const headerGroup = document.createElement('div');
  headerGroup.id = 'ghx-column-headers';
  headerGroup.innerHTML = columns
    .map(c => `<div class="ghx-column" data-id="${c.id}"><span class="ghx-column-title">${c.name}</span></div>`)
    .join('');
  document.body.appendChild(headerGroup);

  const pool = document.createElement('div');
  pool.id = 'ghx-pool';
  pool.innerHTML = swimlanes
    .map(
      sw => `
    <div class="ghx-swimlane" swimlane-id="${sw.id}">
      <div class="ghx-swimlane-header"></div>
      <div class="ghx-columns">
        ${columns.map(c => `<div class="ghx-column" data-column-id="${c.id}"></div>`).join('')}
      </div>
    </div>
  `
    )
    .join('');
  document.body.appendChild(pool);
};

/**
 * PageObject with spied visual methods.
 * Real DOM queries (getSwimlanes, getIssueCount*, getColumns) delegate to BoardPagePageObject.
 * Visual methods (insertSwimlaneComponent, highlightSwimlane, removeSwimlaneComponent) are Cypress stubs.
 */
export const createSpiedPageObject = (): IBoardPagePageObject => ({
  ...BoardPagePageObject,
  insertSwimlaneComponent: cy.stub().as('insertSwimlaneComponent'),
  removeSwimlaneComponent: cy.stub().as('removeSwimlaneComponent'),
  highlightSwimlane: cy.stub().as('highlightSwimlane'),
});

export type BoardContext = {
  model: BoardRuntimeModel;
  settings: SwimlaneSettings;
  pageObject: IBoardPagePageObject;
};

const createBoardContext = (): BoardContext => {
  const settings: SwimlaneSettings = {};

  const mockPropertyModel = {
    load: () => Promise.resolve({ ok: true, val: settings }),
    settings,
  } as unknown as PropertyModel;

  const noopLog = () => {};
  const mockLogger: Logger = {
    getPrefixedLog: () => noopLog,
  } as unknown as Logger;

  const pageObject = createSpiedPageObject();
  const model = new BoardRuntimeModel(mockPropertyModel, pageObject, mockLogger);

  return { model, settings, pageObject };
};

export const setupBackground = (): BoardContext => {
  resetIssueCounter();
  setupBoardDOM();
  return createBoardContext();
};

export const cleanupBoard = () => {
  document.body.innerHTML = '';
};
