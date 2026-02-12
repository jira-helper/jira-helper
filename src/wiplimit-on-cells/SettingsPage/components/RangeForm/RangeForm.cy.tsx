/// <reference types="cypress" />
/**
 * Cypress Component Tests for RangeForm
 *
 * Tests form behavior: filling, Add range / Add cell mode switching, validation.
 */
import React from 'react';
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
  describe('Form filling', () => {
    it('should allow filling all form fields', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={[]}
        />
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIPLC_showBadge').check();

      cy.get('#WIP_inputRange').should('have.value', 'My Range');
      // For antd Select, check that the selected value is displayed
      cy.get('#WIPLC_swimlane').should('contain', 'Frontend');
      cy.get('#WIPLC_Column').should('contain', 'In Progress');
      cy.get('#WIPLC_showBadge').should('be.checked');
    });
  });

  describe('Add range / Add cell mode switching', () => {
    it('should show "Add range" button for new range name', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={['Critical Path']}
        />
      );

      cy.get('#WIP_inputRange').type('New Range');
      cy.get('#WIP_buttonRange').should('contain', 'Add range');
    });

    it('should show "Add cell" button when range name matches existing range', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={['Critical Path']}
        />
      );

      cy.get('#WIP_inputRange').type('Critical Path');
      cy.get('#WIP_buttonRange').should('contain', 'Add cell');
    });

    it('should switch to "Add cell" mode when typing existing range name', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={['Critical Path']}
        />
      );

      cy.get('#WIP_inputRange').type('New');
      cy.get('#WIP_buttonRange').should('contain', 'Add range');

      cy.get('#WIP_inputRange').clear().type('Critical Path');
      cy.get('#WIP_buttonRange').should('contain', 'Add cell');
    });
  });

  describe('Validation', () => {
    it('should disable submit when swimlane is not selected', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={[]}
        />
      );

      cy.window().then(win => {
        cy.stub(win, 'alert').as('alert');
      });

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIP_buttonRange').click();

      cy.get('@alert').should('have.been.calledWith', 'need choose swimlane and column and try again.');
      cy.get('@onAddRange').should('not.have.been.called');
    });

    it('should disable submit when column is not selected', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={[]}
        />
      );

      cy.window().then(win => {
        cy.stub(win, 'alert').as('alert');
      });

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.get('#WIP_buttonRange').click();

      cy.get('@alert').should('have.been.calledWith', 'need choose swimlane and column and try again.');
      cy.get('@onAddRange').should('not.have.been.called');
    });

    it('should not submit when range name is empty', () => {
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={[]}
        />
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
      const onAddRange = cy.stub().returns(true).as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={[]}
        />
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
      const onAddRange = cy.stub().as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={['Critical Path']}
        />
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
      const onAddRange = cy.stub().returns(true).as('onAddRange');
      const onAddCell = cy.stub().as('onAddCell');

      cy.mount(
        <RangeForm
          swimlanes={swimlanes}
          columns={columns}
          onAddRange={onAddRange}
          onAddCell={onAddCell}
          existingRangeNames={[]}
        />
      );

      cy.get('#WIP_inputRange').type('My Range');
      cy.selectAntdOption('#WIPLC_swimlane', 'Frontend');
      cy.selectAntdOption('#WIPLC_Column', 'In Progress');
      cy.get('#WIPLC_showBadge').check();
      cy.get('#WIP_buttonRange').click();

      cy.get('#WIP_inputRange').should('have.value', '');
      cy.get('#WIPLC_swimlane').should('have.value', '-');
      cy.get('#WIPLC_Column').should('have.value', '-');
      cy.get('#WIPLC_showBadge').should('not.be.checked');
    });
  });
});
