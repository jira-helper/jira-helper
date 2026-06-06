/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsButton
 */
import React from 'react';
import { SettingsButton } from './SettingsButton';
import { settingsJiraDOM } from '../../constants';

describe('SettingsButton', () => {
  const defaultLabel = 'Manage per-person WIP-limits';

  it('should render button with correct text', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} label={defaultLabel} />);
    cy.contains('button', defaultLabel).should('be.visible');
  });

  it('should call onClick when clicked', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<SettingsButton onClick={onClick} label={defaultLabel} />);
    cy.contains('button', defaultLabel).click();
    cy.get('@onClick').should('have.been.calledOnce');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} disabled label={defaultLabel} />);
    cy.get('button').should('be.disabled');
  });

  it('should have correct className', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} label={defaultLabel} />);
    cy.get('button').should('have.class', 'ant-btn');
  });

  it('should have correct id from settingsJiraDOM', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} label={defaultLabel} />);
    cy.get(`#${settingsJiraDOM.openEditorBtn}`).should('be.visible');
  });
});
