/// <reference types="cypress" />
/**
 * Cypress Component Tests for RangeForm
 *
 * Tests form behavior: filling, Add range / Add cell mode switching, validation.
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { RangeForm } from './RangeForm';

const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
];

const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
];

describe('RangeForm', () => {
  beforeEach(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
  });

  describe('Form filling', () => {
    it('should allow filling all form fields', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={[]}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIPLC_showBadge').check();

      cy.get('#WIP_inputRange').should('have.value', 'My Range');
      // For antd Select, check that the selected value is displayed in the container
      cy.get('#WIPLC_swimlane').closest('.ant-select').should('contain', 'Frontend');
      cy.get('#WIPLC_Column').closest('.ant-select').should('contain', 'In Progress');
      cy.get('#WIPLC_showBadge').should('be.checked');
    });
  });

  describe('Add range / Add cell mode switching', () => {
    it('should show "Add range" button for new range name', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={['Critical Path']}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('New Range');
      cy.get('#WIP_buttonRange').should('contain', 'Add range');
    });

    it('should show "Add cell" button when range name matches existing range', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={['Critical Path']}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('Critical Path');
      cy.get('#WIP_buttonRange').should('contain', 'Add cell');
    });

    it('should switch to "Add cell" mode when typing existing range name', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={['Critical Path']}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('New');
      cy.get('#WIP_buttonRange').should('contain', 'Add range');

      cy.get('#WIP_inputRange').clear().type('Critical Path');
      cy.get('#WIP_buttonRange').should('contain', 'Add cell');
    });
  });

  describe('Validation', () => {
    it('should disable submit when swimlane is not selected', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={[]}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIP_buttonRange').click();

      cy.contains('Select swimlane').should('exist');
      cy.get('@onAddRange').should('not.have.been.called');
    });

    it('should disable submit when column is not selected', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={[]}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.get('#WIP_buttonRange').click();

      cy.contains('Select Column').should('exist');
      cy.get('@onAddRange').should('not.have.been.called');
    });

    it('should not submit when range name is empty', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={[]}
          />
        </WithDi>
      );

      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIP_buttonRange').click();

      // onAddRange returns false for empty name, so onAddCell should not be called
      cy.get('@onAddRange').should('not.have.been.called');
      cy.get('@onAddCell').should('not.have.been.called');
    });
  });

  describe('Form submission', () => {
    it('should call onAddRange and onAddCell when submitting new range', () => {
      const onAddRange = cy.stub().returns(true);
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={[]}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIPLC_showBadge').check();
      cy.get('#WIP_buttonRange').click();

      cy.get('@onAddRange').should('have.been.calledWith', 'My Range');
      cy.get('@onAddCell').should('have.been.calledWith', 'My Range', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
    });

    it('should call only onAddCell when submitting existing range', () => {
      const onAddRange = cy.stub();
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={['Critical Path']}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('Critical Path');
      cy.selectAntdOption('#WIPLC_swimlane', 'Backend');
      cy.selectAntdOption('#WIPLC_Column', 'Review');
      cy.get('#WIP_buttonRange').click();

      cy.get('@onAddRange').should('not.have.been.called');
      cy.get('@onAddCell').should('have.been.calledWith', 'Critical Path', {
        swimlane: 'sw2',
        column: 'col3',
        showBadge: false,
      });
    });

    it('should reset form after successful submission', () => {
      const onAddRange = cy.stub().returns(true);
      cy.wrap(onAddRange).as('onAddRange');
      const onAddCell = cy.stub();
      cy.wrap(onAddCell).as('onAddCell');

      cy.mount(
        <WithDi container={globalContainer}>
          <RangeForm
            swimlanes={swimlanes}
            columns={columns}
            onAddRange={onAddRange}
            onAddCell={onAddCell}
            existingRangeNames={[]}
          />
        </WithDi>
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIPLC_showBadge').check();
      cy.get('#WIP_buttonRange').click();

      cy.get('#WIP_inputRange').should('have.value', '');
      cy.get('#WIPLC_swimlane').closest('.ant-select').should('contain', '-');
      cy.get('#WIPLC_Column').closest('.ant-select').should('contain', '-');
      cy.get('#WIPLC_showBadge').should('not.be.checked');
    });
  });
});
