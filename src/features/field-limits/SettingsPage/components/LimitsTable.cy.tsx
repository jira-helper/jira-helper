/// <reference types="cypress" />
/**
 * Cypress Component Tests for LimitsTable
 */
import React from 'react';
import { LimitsTable } from './LimitsTable';
import type { FieldLimit, BoardColumn, BoardSwimlane, CardLayoutField } from '../../types';
import { CalcType } from '../../types';

const mockFields: CardLayoutField[] = [
  { fieldId: 'priority', name: 'Priority' },
  { fieldId: 'team', name: 'Team' },
];

const mockColumns: BoardColumn[] = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Done' },
];

const mockSwimlanes: BoardSwimlane[] = [
  { id: 'swim1', name: 'Frontend' },
  { id: 'swim2', name: 'Backend' },
];

const mockLimits: Record<string, FieldLimit> = {
  key1: {
    calcType: CalcType.EXACT_VALUE,
    fieldId: 'priority',
    fieldValue: 'Pro',
    visualValue: 'Pro',
    limit: 5,
    columns: ['col2'],
    swimlanes: [],
  },
  key2: {
    calcType: CalcType.EXACT_VALUE,
    fieldId: 'team',
    fieldValue: 'Frontend',
    visualValue: 'Frontend',
    limit: 10,
    columns: [],
    swimlanes: ['swim1'],
    bkgColor: '#52c41a',
  },
};

describe('LimitsTable', () => {
  it('should render table with data-testid field-limits-table', () => {
    cy.mount(
      <LimitsTable
        limits={mockLimits}
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        fields={mockFields}
        onEdit={cy.stub()}
        onDelete={cy.stub()}
        onColorChange={cy.stub()}
      />
    );
    cy.get('[data-testid="field-limits-table"]').should('be.visible');
  });

  it('should render empty table when limits is empty', () => {
    cy.mount(
      <LimitsTable
        limits={{}}
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        fields={mockFields}
        onEdit={cy.stub()}
        onDelete={cy.stub()}
        onColorChange={cy.stub()}
      />
    );
    cy.get('[data-testid="field-limits-table"]').should('be.visible');
    cy.get('.ant-table-tbody .ant-table-row').should('have.length', 0);
  });

  it('should render limits with Field, Value, Name, Limit, Columns, Swimlanes columns', () => {
    cy.mount(
      <LimitsTable
        limits={mockLimits}
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        fields={mockFields}
        onEdit={cy.stub()}
        onDelete={cy.stub()}
        onColorChange={cy.stub()}
      />
    );
    cy.contains('th', 'Field').should('be.visible');
    cy.contains('th', 'Value').should('be.visible');
    cy.contains('th', 'Name').should('be.visible');
    cy.contains('th', 'Limit').should('be.visible');
    cy.contains('th', 'Columns').should('be.visible');
    cy.contains('th', 'Swimlanes').should('be.visible');
    cy.contains('td', 'Priority').should('be.visible');
    cy.contains('td', 'Pro').should('be.visible');
    cy.contains('td', 'In Progress').should('be.visible');
    cy.contains('td', 'All').should('be.visible');
  });

  it('should call onEdit when Edit button is clicked', () => {
    const onEdit = cy.stub().as('onEdit');
    cy.mount(
      <LimitsTable
        limits={mockLimits}
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        fields={mockFields}
        onEdit={onEdit}
        onDelete={cy.stub()}
        onColorChange={cy.stub()}
      />
    );
    cy.get('.ant-table-tbody tr').first().find('button').first().click();
    cy.get('@onEdit').should('have.been.calledOnceWith', 'key1');
  });

  it('should call onDelete when Delete button is clicked', () => {
    const onDelete = cy.stub().as('onDelete');
    cy.mount(
      <LimitsTable
        limits={mockLimits}
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        fields={mockFields}
        onEdit={cy.stub()}
        onDelete={onDelete}
        onColorChange={cy.stub()}
      />
    );
    cy.get('.ant-table-tbody tr').first().find('button.ant-btn-dangerous').click();
    cy.get('@onDelete').should('have.been.calledOnceWith', 'key1');
  });
});
