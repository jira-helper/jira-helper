/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { AvatarsContainer } from '../components/AvatarsContainer';
import { useRuntimeStore, getInitialState } from '../stores';
import { computeLimitId } from '../utils/computeLimitId';
import type { PersonLimitStats } from '../stores/runtimeStore.types';
import { personLimitsBoardPageObjectToken } from '../pageObject';

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

// --- Utility functions ---

/**
 * Creates a mock issue element in the DOM.
 */
export const createMockIssue = (
  id: string,
  assignee: string,
  columnId: string,
  swimlaneId: string | null = null,
  issueType = 'Task'
): HTMLElement => {
  const issue = document.createElement('div');
  issue.className = 'ghx-issue';
  issue.setAttribute('data-issue-id', id);
  issue.setAttribute('data-assignee', assignee);
  issue.setAttribute('data-column-id', columnId);
  if (swimlaneId) {
    issue.setAttribute('data-swimlane-id', swimlaneId);
  }
  issue.setAttribute('data-issue-type', issueType);
  issue.textContent = `Issue ${id}`;
  return issue;
};

/**
 * Creates PersonLimitStats from limit configuration.
 */
export const createStats = (
  personName: string,
  displayName: string,
  limit: number,
  issues: HTMLElement[],
  limitColumns: Array<{ id: string; name: string }> = [],
  limitSwimlanes: Array<{ id: string; name: string }> = [],
  includedIssueTypes: string[] | undefined = undefined
): PersonLimitStats => {
  const limitParams = {
    person: { name: personName },
    columns: limitColumns,
    swimlanes: limitSwimlanes,
    includedIssueTypes,
  };
  return {
    id: computeLimitId(limitParams),
    person: {
      name: personName,
      displayName,
      avatar: `https://avatar.example.com/${personName}`,
    },
    limit,
    issues,
    columns: limitColumns,
    swimlanes: limitSwimlanes,
    includedIssueTypes,
  };
};

// --- Background setup ---

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);

  globalContainer.register({
    token: personLimitsBoardPageObjectToken,
    value: {
      selectors: {
        issue: '.ghx-issue',
        avatarImg: '.ghx-avatar-img',
        issueType: '.ghx-type',
        column: '.ghx-column',
        swimlane: '.ghx-swimlane',
        swimlaneHeader: '.ghx-swimlane-header-container',
        parentGroup: '.ghx-parent-group',
      },
      getIssues: () => [],
      getAssigneeFromIssue: () => null,
      getColumnId: () => null,
      getColumnIdFromColumn: () => null,
      getSwimlaneId: () => null,
      hasCustomSwimlanes: () => false,
      getSwimlanes: () => [],
      getColumnsInSwimlane: () => [],
      getColumns: () => [],
      getParentGroups: () => [],
      getIssueType: () => null,
      setIssueVisibility: cy.stub(),
      setIssueBackgroundColor: cy.stub(),
      resetIssueBackgroundColor: cy.stub(),
      setSwimlaneVisibility: cy.stub(),
      setParentGroupVisibility: cy.stub(),
      countIssueVisibility: () => ({ total: 0, hidden: 0 }),
    },
  });

  useRuntimeStore.setState(getInitialState());
};

// --- Mount helpers ---

export const mountComponent = () => {
  cy.mount(<AvatarsContainer />);
};
