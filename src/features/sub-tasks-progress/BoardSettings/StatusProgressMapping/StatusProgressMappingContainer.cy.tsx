/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { Ok } from 'ts-results';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import type { JiraIssueMapped, JiraStatus } from 'src/infrastructure/jira/types';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { useSubTaskProgressBoardPropertyStore } from '../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { calcProgress } from '../../IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { StatusProgressMappingContainer } from './StatusProgressMappingContainer';

const statuses: JiraStatus[] = [
  { id: '10000', name: 'To Do', statusCategory: { id: 2, key: 'new', colorName: 'blue-gray', name: 'To Do' } },
  {
    id: '10001',
    name: 'Ready for Release',
    statusCategory: { id: 4, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  { id: '10002', name: 'Done', statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' } },
];

const texts = {
  flaggedIssue: 'Flagged issue',
  blockedByLinks: 'Blocked by links',
};

function openSelect(testId: string) {
  cy.get(`[data-testid="${testId}"]`).find('.ant-select-selector').click();
}

function subtask(overrides: Partial<JiraIssueMapped>): JiraIssueMapped {
  return {
    id: 'id-PROJ-2',
    key: 'PROJ-2',
    project: 'PROJ',
    summary: 'Sub-task',
    status: 'Ready for Release',
    statusId: 10001,
    statusCategory: 'indeterminate',
    statusColor: 'yellow',
    assignee: '',
    created: '2026-04-28T00:00:00.000Z',
    reporter: '',
    priority: '',
    creator: '',
    issueType: 'Sub-task',
    issueTypeName: 'Sub-task',
    isFlagged: false,
    isBlockedByLinks: false,
    fields: {
      subtasks: [],
      issuelinks: [],
    },
    ...overrides,
  } as JiraIssueMapped;
}

describe('StatusProgressMappingContainer', () => {
  beforeEach(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
    useJiraStatusesStore.setState({ statuses, isLoading: false, error: null });
    useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());
  });

  it('stores selected status progress mapping in the board property store flow', () => {
    cy.mount(
      <WithDi container={globalContainer}>
        <StatusProgressMappingContainer />
      </WithDi>
    );

    cy.contains('button', '+ Add status mapping').click();
    openSelect('status-progress-mapping-status-0');
    cy.get('.ant-select-item-option-content').contains('Ready for Release').click();
    openSelect('status-progress-mapping-bucket-0');
    cy.get('.ant-select-item-option-content').contains('Done').click();

    cy.then(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).to.deep.equal({
        '10001': { statusId: '10001', statusName: 'Ready for Release', bucket: 'done' },
      });
    });
  });

  it('loads Jira statuses for autocomplete when the board settings store is empty', () => {
    useJiraStatusesStore.setState({ statuses: [], isLoading: false, error: null });
    globalContainer.register({
      token: JiraServiceToken,
      value: {
        getStatuses: cy.stub().resolves(Ok(statuses)),
      } as unknown as IJiraService,
    });

    cy.mount(
      <WithDi container={globalContainer}>
        <StatusProgressMappingContainer />
      </WithDi>
    );

    cy.contains('button', '+ Add status mapping').click();
    openSelect('status-progress-mapping-status-0');

    cy.get('.ant-select-item-option-content').contains('Ready for Release').should('be.visible');
  });

  it('clears stored mapping when the last valid row is removed and an empty row remains', () => {
    useSubTaskProgressBoardPropertyStore.getState().actions.setStatusProgressMapping({
      '10001': { statusId: '10001', statusName: 'Ready for Release', bucket: 'done' },
    });

    cy.mount(
      <WithDi container={globalContainer}>
        <StatusProgressMappingContainer />
      </WithDi>
    );

    cy.contains('button', '+ Add status mapping').click();
    cy.get('button[aria-label="Remove status mapping"]').first().click();

    cy.then(() => {
      expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).to.deep.equal({});
    });
  });

  it('applies status progress mapping by id and ignores matching fallback names', () => {
    const result = calcProgress(
      [
        subtask({ key: 'PROJ-11', statusId: 10001, status: 'Released', statusCategory: 'indeterminate' }),
        subtask({ key: 'PROJ-12', statusId: 20001, status: 'Ready for Release', statusCategory: 'indeterminate' }),
      ],
      {
        flagsAsBlocked: true,
        blockedByLinksAsBlocked: true,
        statusProgressMapping: {
          '10001': { statusId: '10001', statusName: 'Ready for Release', bucket: 'done' },
        },
      },
      texts
    );

    expect(result.progress).to.deep.equal({ todo: 0, inProgress: 1, done: 1, blocked: 0 });
  });
});
