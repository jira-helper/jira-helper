/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsButton
 */
import React from 'react';
import { SettingsButton } from './SettingsButton';
import { settingsJiraDOM } from '../../constants';

describe('SettingsButton', () => {
  it('should render button with correct text', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} />);
    cy.contains('button', 'Manage per-person WIP-limits').should('be.visible');
  });

  it('should call onClick when clicked', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<SettingsButton onClick={onClick} />);
    cy.contains('button', 'Manage per-person WIP-limits').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} disabled />);
    cy.get('button').should('be.disabled');
  });

  it('should have correct className', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} />);
    cy.get('button').should('have.class', 'ant-btn');
  });

  it('should have correct id from settingsJiraDOM', () => {
    cy.mount(<SettingsButton onClick={cy.stub()} />);
    cy.get(`#${settingsJiraDOM.openEditorBtn}`).should('be.visible');
  });
});
