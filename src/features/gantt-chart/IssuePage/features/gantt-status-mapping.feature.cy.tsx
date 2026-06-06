/// <reference types="cypress" />
import React, { useState } from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import type { JiraField, JiraStatus } from 'src/infrastructure/jira/types';
import { useJiraFieldsStore } from 'src/infrastructure/jira/fields/jiraFieldsStore';
import { useJiraIssueLinkTypesStore } from 'src/infrastructure/jira/stores/jiraIssueLinkTypesStore';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../models/GanttSettingsModel';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { computeBars, type GanttIssueInput } from '../../utils/computeBars';
import { GanttSettingsModal } from '../components/GanttSettingsModal';
import 'cypress/support/gherkin-steps/common';

const statuses: JiraStatus[] = [
  { id: '10000', name: 'To Do', statusCategory: { id: 2, key: 'new', colorName: 'blue-gray', name: 'To Do' } },
  {
    id: '10001',
    name: 'Ready for Release',
    statusCategory: { id: 4, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  { id: '10002', name: 'Done', statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' } },
];

const fields: JiraField[] = [
  {
    id: 'created',
    name: 'Created',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['created'],
    schema: { type: 'datetime' },
  },
  {
    id: 'duedate',
    name: 'Due date',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['duedate'],
    schema: { type: 'date' },
  },
];

const currentScope: SettingsScope = {
  level: 'global',
};

const initialDraft: GanttScopeSettings = {
  startMappings: [{ source: 'dateField', fieldId: 'created' }],
  endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
  colorRules: [],
  tooltipFieldIds: [],
  exclusionFilters: [],
  includeSubtasks: true,
  includeEpicChildren: false,
  includeIssueLinks: false,
  issueLinkTypesToInclude: [],
};

function openSelect(testId: string) {
  cy.get(`[data-testid="${testId}"]`).find('.ant-select-selector').click();
}

const ControlledGanttSettingsModal: React.FC = () => {
  const [draft, setDraft] = useState<GanttScopeSettings>(initialDraft);

  return (
    <GanttSettingsModal
      visible
      draft={draft}
      currentScope={currentScope}
      onDraftChange={patch => setDraft(prev => ({ ...prev, ...patch }))}
      onSave={() => {
        localStorage.setItem(
          GANTT_SETTINGS_STORAGE_KEY,
          JSON.stringify({
            storage: { _global: draft },
            statusBreakdownEnabled: false,
          })
        );
      }}
      onCancel={() => {}}
      onScopeLevelChange={() => {}}
      onCopyFrom={() => {}}
    />
  );
};

function issueWithChangelog(overrides: Partial<GanttIssueInput> = {}): GanttIssueInput {
  return {
    id: 'id-PROJ-21',
    key: 'PROJ-21',
    fields: {
      summary: 'Release task',
      created: '2026-04-01T00:00:00.000Z',
      status: {
        id: '10002',
        name: 'Done',
        statusCategory: { key: 'done', colorName: 'green' },
      },
      parent: { key: 'PROJ-20', id: 'id-PROJ-20' },
      issuelinks: [],
    },
    changelog: {
      histories: [
        {
          created: '2026-04-01T09:00:00.000Z',
          items: [
            {
              field: 'status',
              from: '10000',
              fromString: 'To Do',
              to: '10001',
              toString: 'Doing',
              fromStatusCategory: { key: 'new' },
              toStatusCategory: { key: 'indeterminate' },
            },
          ],
        },
        {
          created: '2026-04-03T18:00:00.000Z',
          items: [
            {
              field: 'status',
              from: '10001',
              fromString: 'Doing',
              to: '10002',
              toString: 'Fertig',
              fromStatusCategory: { key: 'indeterminate' },
              toStatusCategory: { key: 'done' },
            },
          ],
        },
        {
          created: '2026-04-04T18:00:00.000Z',
          items: [
            {
              field: 'status',
              from: '10001',
              fromString: 'Doing',
              to: '20002',
              toString: 'Done',
              fromStatusCategory: { key: 'indeterminate' },
              toStatusCategory: { key: 'done' },
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

describe('Gantt status progress mapping', () => {
  beforeEach(() => {
    localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
    useJiraFieldsStore.setState({ fields, isLoading: false, error: null });
    useJiraStatusesStore.setState({ statuses, isLoading: false, error: null });
    useJiraIssueLinkTypesStore.setState({
      linkTypes: [{ id: '10000', name: 'Blocks', inward: 'is blocked by', outward: 'blocks', self: '' }],
      isLoading: false,
      error: null,
    });
  });

  it('saves Gantt status progress mapping by status id through settings', () => {
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });

    cy.mount(
      <WithDi container={globalContainer}>
        <ControlledGanttSettingsModal />
      </WithDi>
    );

    cy.contains('button', '+ Add status mapping').click();
    openSelect('status-progress-mapping-status-0');
    cy.get('.ant-select-item-option-content').contains('Ready for Release').click();
    openSelect('status-progress-mapping-bucket-0');
    cy.get('.ant-select-item-option-content').contains('Done').click();
    cy.get('[data-testid="gantt-settings-save"]').click();

    cy.window().then(() => {
      const payload = JSON.parse(localStorage.getItem(GANTT_SETTINGS_STORAGE_KEY) ?? '{}') as {
        storage?: Record<string, GanttScopeSettings>;
      };
      expect(payload.storage?._global?.statusProgressMapping).to.deep.equal({
        '10001': { statusId: '10001', statusName: 'Ready for Release', bucket: 'done' },
      });
    });
  });

  it('matches statusTransition date mappings by changelog status ids from and to', () => {
    const result = computeBars(
      [issueWithChangelog()],
      {
        ...initialDraft,
        startMappings: [{ source: 'statusTransition', statusId: '10001', statusName: 'In Progress' }],
        endMappings: [{ source: 'statusTransition', statusId: '10002', statusName: 'Done' }],
      },
      new Date('2026-04-10T00:00:00.000Z'),
      'PROJ-20'
    );

    expect(result.bars[0]?.startDate.toISOString().slice(0, 10)).to.eq('2026-04-01');
    expect(result.bars[0]?.endDate.toISOString().slice(0, 10)).to.eq('2026-04-03');
  });

  it('does not resolve legacy statusTransition rows by fallback status name only', () => {
    const result = computeBars(
      [issueWithChangelog()],
      {
        ...initialDraft,
        startMappings: [{ source: 'dateField', fieldId: 'created' }],
        endMappings: [{ source: 'statusTransition', statusName: 'Done' }],
      },
      new Date('2026-04-10T00:00:00.000Z'),
      'PROJ-20'
    );

    expect(result.bars[0]?.isOpenEnded).to.eq(true);
    expect(result.bars[0]?.endDate.toISOString().slice(0, 10)).to.eq('2026-04-10');
  });
});
