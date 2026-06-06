/// <reference types="cypress" />
import React, { useState } from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { ColumnSelectorPure } from './ColumnSelector';

const defaultColumns = [
  { name: 'To Do', enabled: true },
  { name: 'In Progress', enabled: false },
  { name: 'Done', enabled: true },
];

const ControlledColumnSelector: React.FC<{
  columns: { name: string; enabled: boolean }[];
  disabled?: boolean;
}> = ({ columns: initialColumns, disabled }) => {
  const [columns, setColumns] = useState(initialColumns);
  return (
    <ColumnSelectorPure columns={columns} onUpdate={setColumns} disabled={disabled} testIdPrefix="column-selector" />
  );
};

const WrappedColumnSelector: React.FC<{
  columns: { name: string; enabled: boolean }[];
  disabled?: boolean;
}> = props => (
  <WithDi container={globalContainer}>
    <ControlledColumnSelector {...props} />
  </WithDi>
);

describe('ColumnSelector', () => {
  beforeEach(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
  });

  it('should display list of columns', () => {
    cy.mount(<WrappedColumnSelector columns={defaultColumns} />);

    cy.get('[data-testid="column-selector-column"]').should('have.length', 3);
    cy.get('[data-testid="column-selector-column-name"]').first().should('contain.text', 'To Do');
    cy.get('[data-testid="column-selector-column-name"]').eq(1).should('contain.text', 'In Progress');
    cy.get('[data-testid="column-selector-column-name"]').eq(2).should('contain.text', 'Done');
  });

  it('should toggle column on checkbox click', () => {
    const onUpdate = cy.stub().as('onUpdate');
    const Wrapper = () => {
      const [columns, setColumns] = useState(defaultColumns);
      const handleUpdate = (updated: { name: string; enabled: boolean }[]) => {
        onUpdate(updated);
        setColumns(updated);
      };
      return (
        <WithDi container={globalContainer}>
          <ColumnSelectorPure columns={columns} onUpdate={handleUpdate} testIdPrefix="column-selector" />
        </WithDi>
      );
    };

    cy.mount(<Wrapper />);

    // In Progress is initially unchecked
    cy.contains('label', 'In Progress').find('input[type="checkbox"]').should('not.be.checked');

    // Click to enable
    cy.contains('label', 'In Progress').click();

    cy.get('@onUpdate').should('have.been.called');
    cy.contains('label', 'In Progress').find('input[type="checkbox"]').should('be.checked');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<WrappedColumnSelector columns={defaultColumns} disabled />);

    cy.get('[data-testid="column-selector-column-checkbox"]').each($el => {
      expect($el).to.have.attr('disabled');
    });
  });

  it('should show no columns message when empty', () => {
    cy.mount(<WrappedColumnSelector columns={[]} />);

    cy.get('[data-testid="column-selector-no-columns"]')
      .should('be.visible')
      .and('contain.text', 'No columns available');
  });
});
