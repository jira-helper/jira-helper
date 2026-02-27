/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
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

// --- Mock PageObject for tests ---

export type MockPageObject = IPersonLimitsBoardPageObject & {
  addIssue: (id: string, assignee: string, columnId: string, type?: string, swimlaneId?: string | null) => Element;
  getHighlightedIssues: () => Element[];
};

function createMockPageObject(): MockPageObject {
  const mockIssues = new Map<
    string,
    { element: Element; assignee: string; columnId: string; swimlaneId: string | null; type: string }
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
      const element = { id } as unknown as Element;
      mockIssues.set(id, { element, assignee, columnId, swimlaneId, type });
      return element;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getIssues(_cssSelector: string) {
      return Array.from(mockIssues.values()).map(i => i.element);
    },

    getAssigneeFromIssue(issue: Element) {
      const { id } = issue as { id?: string };
      return mockIssues.get(id ?? '')?.assignee ?? null;
    },

    getIssueType(issue: Element) {
      const { id } = issue as { id?: string };
      return mockIssues.get(id ?? '')?.type ?? null;
    },

    getColumnId(issue: Element) {
      const { id } = issue as { id?: string };
      return mockIssues.get(id ?? '')?.columnId ?? null;
    },

    getColumnIdFromColumn(column: Element) {
      return (column as { columnId?: string }).columnId ?? null;
    },

    getSwimlaneId(issue: Element) {
      const { id } = issue as { id?: string };
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setIssueBackgroundColor(issue: Element, _color: string) {
      highlightedIssues.push(issue);
    },
    getHighlightedIssues() {
      return [...highlightedIssues];
    },
    resetIssueBackgroundColor: cy.stub(),
    setIssueVisibility: cy.stub(),
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
    token: personLimitsBoardPageObjectToken,
    value: mockPageObject,
  });

  usePersonWipLimitsPropertyStore.getState().actions.reset();
  useRuntimeStore.setState(getInitialState());
};

// --- Mount helpers ---

export const mountComponent = () => {
  cy.mount(<AvatarsContainer />);
};
