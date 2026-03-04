/// <reference types="cypress" />
/**
 * Cypress Component Tests for RangeTable
 *
 * Tests component behavior: display, inline editing, delete callbacks.
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { RangeTable } from './RangeTable';
import type { WipLimitRange } from '../../../types';

const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
];

const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
];

const createRange = (
  name: string,
  wipLimit: number = 0,
  cells: Array<{ swimlane: string; column: string; showBadge: boolean }> = [],
  disable: boolean = false
): WipLimitRange => ({
  name,
  wipLimit,
  cells,
  disable,
});

const getNameLabel = (swimlaneId: string, columnId: string): string => {
  const sw = swimlanes.find(s => s.id === swimlaneId);
  const col = columns.find(c => c.id === columnId);
  return `${sw?.name ?? 'Unknown'} / ${col?.name ?? 'Unknown'}`;
};

describe('RangeTable', () => {
  beforeEach(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
  });

  describe('Empty table', () => {
    it('should display empty table with headers', () => {
      const onDeleteRange = cy.stub().as('onDeleteRange');
      const onDeleteCell = cy.stub().as('onDeleteCell');
      const onChangeField = cy.stub().as('onChangeField');
      const onSelectRange = cy.stub().as('onSelectRange');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={[]}
            onDeleteRange={onDeleteRange}
            onDeleteCell={onDeleteCell}
            onChangeField={onChangeField}
            onSelectRange={onSelectRange}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      cy.get('#WipLimitCells_table').should('exist');
      cy.get('thead').should('contain', 'Range name');
      cy.get('thead').should('contain', 'WIP limit');
      cy.get('thead').should('contain', 'Disable');
      cy.get('thead').should('contain', 'Cells (swimlane/column)');
      cy.get('#WipLimitCells_tbody').find('tr').should('have.length', 0);
    });
  });

  describe('Display ranges with cells', () => {
    it('should display ranges with cells', () => {
      const ranges: WipLimitRange[] = [
        createRange('Critical Path', 5, [
          { swimlane: 'sw1', column: 'col2', showBadge: true },
          { swimlane: 'sw2', column: 'col2', showBadge: false },
        ]),
        createRange('Review Path', 3, [{ swimlane: 'sw1', column: 'col3', showBadge: true }]),
      ];

      const onDeleteRange = cy.stub().as('onDeleteRange');
      const onDeleteCell = cy.stub().as('onDeleteCell');
      const onChangeField = cy.stub().as('onChangeField');
      const onSelectRange = cy.stub().as('onSelectRange');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={onDeleteRange}
            onDeleteCell={onDeleteCell}
            onChangeField={onChangeField}
            onSelectRange={onSelectRange}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      cy.get('#WipLimitCells_tbody').find('tr').should('have.length', 2);
      cy.get('input[aria-label*="Range name for Critical Path"]').should('exist');
      cy.get('input[aria-label*="Range name for Review Path"]').should('exist');
      cy.contains('Frontend / In Progress').should('exist');
      cy.contains('Backend / In Progress').should('exist');
      cy.contains('Frontend / Review').should('exist');
    });
  });

  describe('Inline editing', () => {
    it('should allow editing range name', () => {
      const ranges: WipLimitRange[] = [createRange('Critical Path', 5)];
      const onChangeField = cy.stub().as('onChangeField');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={cy.stub()}
            onDeleteCell={cy.stub()}
            onChangeField={onChangeField}
            onSelectRange={cy.stub()}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      // Type new value and trigger blur - use first() to select the name input specifically
      cy.get('input[aria-label*="Range name for Critical Path"]').first().focus().type('{selectall}Hot Path').blur();
      cy.get('@onChangeField').should('have.been.calledWith', 'Critical Path', 'name', 'Hot Path');
    });

    it('should allow editing WIP limit', () => {
      const ranges: WipLimitRange[] = [createRange('Critical Path', 5)];
      const onChangeField = cy.stub().as('onChangeField');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={cy.stub()}
            onDeleteCell={cy.stub()}
            onChangeField={onChangeField}
            onSelectRange={cy.stub()}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      cy.get('input[aria-label*="WIP limit for Critical Path"]').type('{selectall}10');
      cy.get('input[aria-label*="WIP limit for Critical Path"]').blur();
      cy.get('@onChangeField').should('have.been.calledWith', 'Critical Path', 'wipLimit', 10);
    });

    it('should allow toggling disable checkbox', () => {
      const ranges: WipLimitRange[] = [createRange('Critical Path', 5, [], false)];
      const onChangeField = cy.stub().as('onChangeField');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={cy.stub()}
            onDeleteCell={cy.stub()}
            onChangeField={onChangeField}
            onSelectRange={cy.stub()}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      cy.get('input[aria-label*="Disable range Critical Path"]').check();
      cy.get('@onChangeField').should('have.been.calledWith', 'Critical Path', 'disable', true);
    });
  });

  describe('Delete callbacks', () => {
    it('should call onDeleteRange when delete icon is clicked', () => {
      const ranges: WipLimitRange[] = [createRange('Critical Path', 5)];
      const onDeleteRange = cy.stub().as('onDeleteRange');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={onDeleteRange}
            onDeleteCell={cy.stub()}
            onChangeField={cy.stub()}
            onSelectRange={cy.stub()}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      cy.get('[aria-label="Delete range Critical Path"]').click();
      cy.get('@onDeleteRange').should('have.been.calledWith', 'Critical Path');
    });

    it('should call onDeleteCell when cell delete icon is clicked', () => {
      const ranges: WipLimitRange[] = [
        createRange('Critical Path', 5, [{ swimlane: 'sw1', column: 'col2', showBadge: false }]),
      ];
      const onDeleteCell = cy.stub().as('onDeleteCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={cy.stub()}
            onDeleteCell={onDeleteCell}
            onChangeField={cy.stub()}
            onSelectRange={cy.stub()}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      // Find the Tag containing "Frontend / In Progress" and click its close icon
      cy.contains('.ant-tag', 'Frontend / In Progress').find('.ant-tag-close-icon').click();
      cy.get('@onDeleteCell').should('have.been.calledWith', 'Critical Path', 'sw1', 'col2');
    });
  });

  describe('Select range callback', () => {
    it('should call onSelectRange when edit icon is clicked', () => {
      const ranges: WipLimitRange[] = [createRange('Critical Path', 5)];
      const onSelectRange = cy.stub().as('onSelectRange');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeTable
            ranges={ranges}
            onDeleteRange={cy.stub()}
            onDeleteCell={cy.stub()}
            onChangeField={cy.stub()}
            onSelectRange={onSelectRange}
            getNameLabel={getNameLabel}
          />
        </WithDi>
      );

      cy.get('[aria-label*="Select range Critical Path"]').click();
      cy.get('@onSelectRange').should('have.been.calledWith', 'Critical Path');
    });
  });
});
