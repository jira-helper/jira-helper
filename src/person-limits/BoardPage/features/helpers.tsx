/// <reference types="cypress" />
import React, { useRef, useEffect } from 'react';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { registerJiraApiInDI } from 'src/shared/di/jiraApiTokens';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { WithDi } from 'src/shared/diContext';
import { AvatarsContainer } from '../components/AvatarsContainer';
import { useRuntimeStore, getInitialState } from '../stores';
import { usePersonWipLimitsPropertyStore } from '../../property';
import { personLimitsBoardPageObjectToken } from '../pageObject';
import type { IPersonLimitsBoardPageObject } from '../pageObject';

// --- Fixtures matching feature Background ---

export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Swimlane 1' },
  { id: 'sw2', name: 'Swimlane 2' },
];

/** Creates a real DOM element for an issue (for interaction tests with visibility checks). */
function createMockIssueElement(
  id: string,
  assignee: string,
  columnId: string,
  type: string,
  swimlaneId: string | null
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ghx-issue';
  el.setAttribute('data-issue-id', id);
  el.setAttribute('data-assignee', assignee);
  el.setAttribute('data-column-id', columnId);
  el.setAttribute('data-issue-type', type);
  if (swimlaneId) el.setAttribute('data-swimlane-id', swimlaneId);
  el.textContent = `Issue ${id}`;
  return el;
}

function getIssueId(issue: Element): string | null {
  return (issue as HTMLElement).getAttribute?.('data-issue-id') ?? (issue as { id?: string }).id ?? null;
}

// --- Mock PageObject for tests ---

export type MockPageObject = IPersonLimitsBoardPageObject & {
  addIssue: (id: string, assignee: string, columnId: string, type?: string, swimlaneId?: string | null) => Element;
  getHighlightedIssues: () => Element[];
  appendIssuesToBoard: (container: HTMLElement) => void;
};

function createMockPageObject(): MockPageObject {
  const mockIssues = new Map<
    string,
    { element: HTMLElement; assignee: string; columnId: string; swimlaneId: string | null; type: string }
  >();
  const highlightedIssues: Element[] = [];

  const mockPageObject: MockPageObject = {
    selectors: {
      issue: '.ghx-issue',
      avatarImg: '.ghx-avatar-img',
      issueType: '.ghx-type',
      column: '.ghx-column',
      swimlane: '.ghx-swimlane',
      swimlaneHeader: '.ghx-swimlane-header-container',
      parentGroup: '.ghx-parent-group',
    },

    addIssue(id, assignee, columnId, type = 'Task', swimlaneId = null) {
      const element = createMockIssueElement(id, assignee, columnId, type, swimlaneId);
      mockIssues.set(id, { element, assignee, columnId, swimlaneId, type });
      return element;
    },

    appendIssuesToBoard(container: HTMLElement) {
      mockIssues.forEach(({ element }) => {
        container.appendChild(element);
      });
    },

    getIssues() {
      return Array.from(mockIssues.values()).map(i => i.element);
    },

    getAssigneeFromIssue(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.assignee ?? null;
    },

    getIssueType(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.type ?? null;
    },

    getColumnId(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.columnId ?? null;
    },

    getColumnIdFromColumn(column: Element) {
      return (column as { columnId?: string }).columnId ?? null;
    },

    getSwimlaneId(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.swimlaneId ?? null;
    },

    hasCustomSwimlanes() {
      return Array.from(mockIssues.values()).some(i => i.swimlaneId != null);
    },

    getSwimlanes() {
      const swimlaneIds = new Set<string>();
      mockIssues.forEach(issue => {
        if (issue.swimlaneId != null) swimlaneIds.add(issue.swimlaneId);
      });
      return Array.from(swimlaneIds).map(
        swId =>
          ({
            getAttribute: (name: string) => (name === 'swimlane-id' ? swId : null),
          }) as unknown as Element
      );
    },

    getColumnsInSwimlane(swimlane: Element) {
      const swimlaneId = (swimlane as { getAttribute?: (name: string) => string | null }).getAttribute?.('swimlane-id');
      const columnIds = new Set<string>();
      mockIssues.forEach(issue => {
        if (issue.swimlaneId === swimlaneId) columnIds.add(issue.columnId);
      });
      return Array.from(columnIds).map(
        colId =>
          ({
            columnId: colId,
            querySelectorAll: (selector: string) => {
              if (selector === '.ghx-issue') {
                return Array.from(mockIssues.values())
                  .filter(i => i.columnId === colId && i.swimlaneId === swimlaneId)
                  .map(i => i.element);
              }
              return [];
            },
          }) as unknown as Element
      );
    },

    getColumns() {
      const columnIds = new Set<string>();
      mockIssues.forEach(issue => columnIds.add(issue.columnId));
      return Array.from(columnIds).map(
        id =>
          ({
            columnId: id,
            querySelectorAll: (selector: string) => {
              if (selector === '.ghx-issue') {
                return Array.from(mockIssues.values())
                  .filter(i => i.columnId === id)
                  .map(i => i.element);
              }
              return [];
            },
          }) as unknown as Element
      );
    },

    getParentGroups() {
      return [];
    },

    countIssueVisibility() {
      return { total: 0, hidden: 0 };
    },

    setIssueBackgroundColor(issue: Element) {
      highlightedIssues.push(issue);
    },
    getHighlightedIssues() {
      return [...highlightedIssues];
    },
    resetIssueBackgroundColor: cy.stub(),
    setIssueVisibility(issue: Element, visible: boolean) {
      (issue as HTMLElement).style.display = visible ? '' : 'none';
    },
    setSwimlaneVisibility: cy.stub(),
    setParentGroupVisibility: cy.stub(),
  };

  return mockPageObject;
}

/** Shared mock PageObject reference, set in setupBackground before each scenario. */
export const mockPageObjectRef: { current: MockPageObject | null } = { current: null };

// --- Background setup ---

export const setupBackground = () => {
  mockPageObjectRef.current = null;
  globalContainer.reset();
  registerLogger(globalContainer);

  const mockPageObject = createMockPageObject();
  mockPageObjectRef.current = mockPageObject;

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
  globalContainer.register({
    token: personLimitsBoardPageObjectToken,
    value: mockPageObject,
  });
  registerJiraApiInDI(globalContainer);

  usePersonWipLimitsPropertyStore.getState().actions.reset();
  useRuntimeStore.setState(getInitialState());
};

// --- Mount helpers ---

/** Wrapper that mounts AvatarsContainer + board container for issues (interaction tests). */
const BoardWithAvatars: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mock = mockPageObjectRef.current;
    if (mock && boardRef.current && 'appendIssuesToBoard' in mock) {
      mock.appendIssuesToBoard(boardRef.current);
    }
  }, []);

  return (
    <WithDi container={globalContainer}>
      <div ref={boardRef} data-cy="board-container" />
      <AvatarsContainer />
    </WithDi>
  );
};

export const mountComponent = () => {
  cy.mount(<BoardWithAvatars />);
};
