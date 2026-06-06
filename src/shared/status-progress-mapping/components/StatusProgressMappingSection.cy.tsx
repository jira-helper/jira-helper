/// <reference types="cypress" />
import React, { useState } from 'react';
import type { JiraStatus } from 'src/infrastructure/jira/types';
import type { StatusProgressMappingRow } from '../types';
import { StatusProgressMappingSection } from './StatusProgressMappingSection';

const statuses: JiraStatus[] = [
  { id: '10000', name: 'To Do', statusCategory: { id: 2, key: 'new', colorName: 'blue-gray', name: 'To Do' } },
  {
    id: '10001',
    name: 'Ready for QA',
    statusCategory: { id: 4, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  { id: '10002', name: 'Done', statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' } },
];

const texts = {
  statusLabel: 'Jira status',
  bucketLabel: 'Progress bucket',
  selectStatusPlaceholder: 'Select Jira status',
  selectBucketPlaceholder: 'Select bucket',
  removeRow: 'Remove status mapping',
  noStatusFound: 'No status found',
};

function openSelect(testId: string) {
  cy.get(`[data-testid="${testId}"]`).find('.ant-select-selector').click();
}

const ControlledSection: React.FC<{
  initialRows?: StatusProgressMappingRow[];
  jiraStatuses?: JiraStatus[];
  onRowsChange?: (rows: StatusProgressMappingRow[]) => void;
}> = ({ initialRows = [], jiraStatuses = statuses, onRowsChange }) => {
  const [rows, setRows] = useState(initialRows);

  return (
    <StatusProgressMappingSection
      title="Status progress mapping"
      description="Map Jira statuses to progress buckets."
      addButtonLabel="+ Add status mapping"
      rows={rows}
      statuses={jiraStatuses}
      isLoadingStatuses={false}
      onChange={nextRows => {
        onRowsChange?.(nextRows);
        setRows(nextRows);
      }}
      texts={texts}
    />
  );
};

describe('StatusProgressMappingSection', () => {
  it('selects a Jira status from autocomplete and emits its status id', () => {
    const onRowsChange = cy.stub().as('onRowsChange');
    cy.mount(<ControlledSection onRowsChange={onRowsChange} />);

    cy.contains('button', '+ Add status mapping').click();
    openSelect('status-progress-mapping-status-0');
    cy.get('.ant-select-item-option-content').contains('Ready for QA').click();
    openSelect('status-progress-mapping-bucket-0');
    cy.get('.ant-select-item-option-content').contains('Done').click();

    cy.get('@onRowsChange').should('have.been.calledWith', [
      { statusId: '10001', statusName: 'Ready for QA', bucket: 'done' },
    ]);
  });

  it('does not emit arbitrary status search text as a selected status', () => {
    const onRowsChange = cy.stub().as('onRowsChange');
    cy.mount(<ControlledSection onRowsChange={onRowsChange} />);

    cy.contains('button', '+ Add status mapping').click();
    openSelect('status-progress-mapping-status-0');
    cy.get('[role="combobox"][aria-label="Jira status"]').type('Missing Status');

    cy.contains('No status found').should('be.visible');
    cy.get('@onRowsChange').should('have.been.calledOnce');
    cy.get('@onRowsChange').should('not.have.been.calledWithMatch', [
      { statusId: 'Missing Status', statusName: 'Missing Status' },
    ]);
  });

  it('shows the current Jira status label instead of the saved fallback name', () => {
    cy.mount(
      <ControlledSection
        initialRows={[{ statusId: '10001', statusName: 'Old QA Label', bucket: 'inProgress' }]}
        jiraStatuses={[{ ...statuses[1], name: 'Ready for Review' }]}
      />
    );

    cy.contains('Ready for Review').should('be.visible');
    cy.contains('Old QA Label').should('not.exist');
  });

  it('shows a fallback label for missing Jira status ids and keeps the id on emit', () => {
    const onRowsChange = cy.stub().as('onRowsChange');
    cy.mount(
      <ControlledSection
        initialRows={[{ statusId: '99999', statusName: 'Archived Review', bucket: 'inProgress' }]}
        jiraStatuses={statuses}
        onRowsChange={onRowsChange}
      />
    );

    cy.contains('Archived Review').should('be.visible');
    openSelect('status-progress-mapping-bucket-0');
    cy.get('.ant-select-item-option-content').contains('Done').click();

    cy.get('@onRowsChange').should('have.been.calledWith', [
      { statusId: '99999', statusName: 'Archived Review', bucket: 'done' },
    ]);
  });

  it('offers only todo, in progress, and done buckets without blocked', () => {
    cy.mount(<ControlledSection initialRows={[{ statusId: '10001', statusName: 'Ready for QA', bucket: 'todo' }]} />);

    openSelect('status-progress-mapping-bucket-0');

    cy.get('.ant-select-item-option-content').should('have.length', 3);
    cy.get('.ant-select-item-option-content').then($options => {
      const labels = [...$options].map(option => option.textContent);
      expect(labels).to.deep.equal(['To Do', 'In Progress', 'Done']);
      expect(labels).not.to.include('Blocked');
    });
  });
});
