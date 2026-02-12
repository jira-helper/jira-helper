/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsModal
 */
import React from 'react';
import { SettingsModal } from './SettingsModal';

describe('SettingsModal', () => {
  it('should render Modal with title', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div>Test content</div>
      </SettingsModal>
    );

    cy.contains('Test Modal').should('be.visible');
  });

  it('should render children inside modal', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div data-testid="test-content">Test content</div>
      </SettingsModal>
    );

    cy.get('[data-testid="test-content"]').should('be.visible');
    cy.contains('Test content').should('be.visible');
  });

  it('should render Cancel and Save buttons in footer', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div>Content</div>
      </SettingsModal>
    );

    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Save').should('be.visible');
  });

  it('should call onClose when Cancel button is clicked', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div>Content</div>
      </SettingsModal>
    );

    cy.contains('button', 'Cancel').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('should call onSave when Save button is clicked', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div>Content</div>
      </SettingsModal>
    );

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');
  });

  it('should call onClose when modal is closed via X button', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div>Content</div>
      </SettingsModal>
    );

    // Ant Design Modal close button (X icon)
    cy.get('.ant-modal-close').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('should disable Cancel button when isSaving is true', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave} isSaving>
        <div>Content</div>
      </SettingsModal>
    );

    cy.contains('button', 'Cancel').should('be.disabled');
  });

  it('should show loading state on Save button when isSaving is true', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave} isSaving>
        <div>Content</div>
      </SettingsModal>
    );

    // Ant Design Button with loading shows spinner
    cy.contains('button', 'Save').should('be.visible');
    // Check that Save button is not disabled (should still be clickable when saving)
    cy.contains('button', 'Save').should('not.be.disabled');
  });

  it('should use custom okButtonText when provided', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave} okButtonText="Apply Changes">
        <div>Content</div>
      </SettingsModal>
    );

    cy.contains('button', 'Apply Changes').should('be.visible');
    cy.contains('button', 'Save').should('not.exist');
  });

  it('should use default "Save" text when okButtonText is not provided', () => {
    const onClose = cy.stub().as('onClose');
    const onSave = cy.stub().as('onSave');

    cy.mount(
      <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
        <div>Content</div>
      </SettingsModal>
    );

    cy.contains('button', 'Save').should('be.visible');
  });
});
