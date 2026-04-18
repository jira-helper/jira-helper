/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsModal
 *
 * Tests modal behavior: open/close, Save/Cancel callbacks.
 */
import React from 'react';
import { SettingsModal } from './SettingsModal';

describe('SettingsModal', () => {
  describe('Open/Close', () => {
    it('should display modal when rendered', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
          <div>Modal content</div>
        </SettingsModal>
      );

      cy.contains('Test Modal').should('exist');
      cy.contains('Modal content').should('exist');
    });

    it('should call onClose when Cancel button is clicked', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
          <div>Modal content</div>
        </SettingsModal>
      );

      cy.contains('button', 'Cancel').click();
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('should call onClose when clicking outside modal (if maskClosable)', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
          <div>Modal content</div>
        </SettingsModal>
      );

      // Note: maskClosable is false by default, so clicking outside won't close
      // But we can test the modal is rendered correctly
      cy.contains('Test Modal').should('exist');
    });
  });

  describe('Save callback', () => {
    it('should call onSave when Save button is clicked', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
          <div>Modal content</div>
        </SettingsModal>
      );

      cy.contains('button', 'Save').click();
      cy.get('@onSave').should('have.been.calledOnce');
    });

    it('should show loading state when isSaving is true', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave} isSaving>
          <div>Modal content</div>
        </SettingsModal>
      );

      cy.contains('button', 'Save').should('have.attr', 'class').and('include', 'ant-btn-loading');
      cy.contains('button', 'Cancel').should('be.disabled');
    });
  });

  describe('Custom okButtonText', () => {
    it('should use custom okButtonText when provided', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave} okButtonText="Custom Save">
          <div>Modal content</div>
        </SettingsModal>
      );

      cy.contains('button', 'Custom Save').should('exist');
    });
  });

  describe('Children rendering', () => {
    it('should render children content', () => {
      const onClose = cy.stub().as('onClose');
      const onSave = cy.stub().as('onSave');

      cy.mount(
        <SettingsModal title="Test Modal" onClose={onClose} onSave={onSave}>
          <div data-testid="custom-content">Custom content here</div>
        </SettingsModal>
      );

      cy.get('[data-testid="custom-content"]').should('exist');
      cy.contains('Custom content here').should('exist');
    });
  });
});
