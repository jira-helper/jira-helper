/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsButton
 */
import React from 'react';
import { SettingsButton } from './SettingsButton';

describe('SettingsButton', () => {
  const label = 'Edit WIP limits by field';

  it('should render button with correct text', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} label={label} />);
    cy.contains('button', label).should('be.visible');
  });

  it('should call onClick when clicked', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<SettingsButton onClick={onClick} label={label} />);
    cy.contains('button', label).click();
    cy.get('@onClick').should('have.been.calledOnce');
  });

  it('should have data-testid field-limits-settings-button', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} label={label} />);
    cy.get('[data-testid="field-limits-settings-button"]').should('be.visible');
  });
});
