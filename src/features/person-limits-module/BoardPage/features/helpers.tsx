/// <reference types="cypress" />
import React, { useRef, useEffect } from 'react';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { registerJiraApiInDI } from 'src/shared/di/jiraApiTokens';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject, type SwimlaneElement } from 'src/page-objects/BoardPage';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { WithDi } from 'src/shared/diContext';
import { AvatarsContainer } from '../components/AvatarsContainer';
import { personLimitsModule } from '../../module';
import { boardRuntimeModelToken, propertyModelToken } from '../../tokens';
import type { PropertyModel } from '../../property/PropertyModel';
import type { BoardRuntimeModel } from '../models/BoardRuntimeModel';

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

export type MockPageObject = IBoardPagePageObject & {
  addIssue: (id: string, assignee: string, columnId: string, type?: string, swimlaneId?: string | null) => Element;
  getHighlightedIssues: () => Element[];
  appendIssuesToBoard: (container: HTMLElement) => void;
};

const mockBoardPropertyService: BoardPropertyServiceI = {
  async getBoardProperty() {
    return undefined;
  },
  updateBoardProperty() {},
  deleteBoardProperty() {},
};

function createMockPageObject(): MockPageObject {
  const mockIssues = new Map<
    string,
    { element: HTMLElement; assignee: string; columnId: string; swimlaneId: string | null; type: string }
  >();
  const highlightedIssues: Element[] = [];

  const custom = {
    addIssue(id: string, assignee: string, columnId: string, type = 'Task', swimlaneId: string | null = null) {
      const element = createMockIssueElement(id, assignee, columnId, type, swimlaneId);
      mockIssues.set(id, { element, assignee, columnId, swimlaneId, type });
      return element;
    },

    appendIssuesToBoard(container: HTMLElement) {
      mockIssues.forEach(({ element }) => {
        container.appendChild(element);
      });
    },

    getIssueElements(cssSelector: string) {
      if (cssSelector === '.ghx-issue') {
        return Array.from(mockIssues.values()).map(i => i.element);
      }
      return [];
    },

    getAssigneeFromIssue(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.assignee ?? null;
    },

    getIssueTypeFromIssue(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.type ?? null;
    },

    getColumnIdOfIssue(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.columnId ?? null;
    },

    getColumnIdFromColumn(column: Element) {
      return (column as { columnId?: string }).columnId ?? null;
    },

    getSwimlaneIdOfIssue(issue: Element) {
      const id = getIssueId(issue);
      return mockIssues.get(id ?? '')?.swimlaneId ?? null;
    },

    hasCustomSwimlanes() {
      return Array.from(mockIssues.values()).some(i => i.swimlaneId != null);
    },

    getSwimlanes(): SwimlaneElement[] {
      const swimlaneIds = new Set<string>();
      mockIssues.forEach(issue => {
        if (issue.swimlaneId != null) swimlaneIds.add(issue.swimlaneId);
      });
      return Array.from(swimlaneIds).map(swId => {
        const element = {
          getAttribute: (name: string) => (name === 'swimlane-id' ? swId : null),
        } as unknown as Element;
        return {
          id: swId,
          element,
          header: document.createElement('div'),
        };
      });
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

    getColumnElements() {
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

  return {
    ...BoardPagePageObject,
    ...custom,
  } as MockPageObject;
}

/** Shared mock PageObject reference, set in setupBackground before each scenario. */
export const mockPageObjectRef: { current: MockPageObject | null } = { current: null };

function getPropertyModel(): PropertyModel {
  return globalContainer.inject(propertyModelToken).model;
}

function getBoardRuntimeModel(): BoardRuntimeModel {
  return globalContainer.inject(boardRuntimeModelToken).model;
}

// --- Background setup ---

export const setupBackground = () => {
  mockPageObjectRef.current = null;
  globalContainer.reset();
  registerLogger(globalContainer);

  globalContainer.register({
    token: BoardPropertyServiceToken,
    value: mockBoardPropertyService,
  });

  const mockPageObject = createMockPageObject();
  mockPageObjectRef.current = mockPageObject;

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
  globalContainer.register({
    token: boardPagePageObjectToken,
    value: mockPageObject,
  });
  registerJiraApiInDI(globalContainer);

  personLimitsModule.ensure(globalContainer);

  getPropertyModel().reset();
  getBoardRuntimeModel().reset();
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
