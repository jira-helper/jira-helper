/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsModalContainer
 */
import React from 'react';
import { SettingsModalContainer } from './SettingsModalContainer';
import { useSettingsUIStore } from '../../stores/settingsUIStore';
import type { Column, Swimlane } from '../../state/types';

describe('SettingsModalContainer', () => {
  const columns: Column[] = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
    { id: 'col3', name: 'Done' },
  ];

  const swimlanes: Swimlane[] = [
    { id: 'swim1', name: 'Frontend' },
    { id: 'swim2', name: 'Backend' },
  ];

  beforeEach(() => {
    useSettingsUIStore.getState().actions.reset();
  });

  it('should render modal with PersonalWipLimitContainer inside', () => {
    const onClose = cy.stub().as('onClose');
    // @ts-expect-error
    const onSave = cy.stub().resolves().as('onSave');

    cy.mount(<SettingsModalContainer columns={columns} swimlanes={swimlanes} onClose={onClose} onSave={onSave} />);

    cy.contains('Personal WIP Limit').should('be.visible');
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should call onClose when Cancel is clicked', () => {
    const onClose = cy.stub().as('onClose');
    // @ts-expect-error
    const onSave = cy.stub().resolves().as('onSave');

    cy.mount(<SettingsModalContainer columns={columns} swimlanes={swimlanes} onClose={onClose} onSave={onSave} />);

    cy.contains('button', 'Cancel').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('should call onSave when Save is clicked', () => {
    const onClose = cy.stub().as('onClose');
    // @ts-expect-error
    const onSave = cy.stub().resolves().as('onSave');

    cy.mount(<SettingsModalContainer columns={columns} swimlanes={swimlanes} onClose={onClose} onSave={onSave} />);

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');
  });

  it('should show loading state while saving', () => {
    const onClose = cy.stub().as('onClose');
    let resolveSave: () => void;
    const onSave = cy
      .stub()
      .returns(
        new Promise<void>(resolve => {
          resolveSave = resolve;
        })
      )
      // @ts-expect-error
      .as('onSave');

    cy.mount(<SettingsModalContainer columns={columns} swimlanes={swimlanes} onClose={onClose} onSave={onSave} />);

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');

    // Check that Save button is in loading state
    cy.contains('button', 'Save').should('have.attr', 'class').and('include', 'ant-btn-loading');

    // Resolve the promise
    cy.then(() => {
      resolveSave!();
    });
  });

  it('should disable Cancel button while saving', () => {
    const onClose = cy.stub().as('onClose');
    let resolveSave: () => void;
    const onSave = cy
      .stub()
      .returns(
        new Promise<void>(resolve => {
          resolveSave = resolve;
        })
      )
      // @ts-expect-error
      .as('onSave');

    cy.mount(<SettingsModalContainer columns={columns} swimlanes={swimlanes} onClose={onClose} onSave={onSave} />);

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');

    // Check that Cancel button is disabled
    cy.contains('button', 'Cancel').should('be.disabled');

    // Resolve the promise
    cy.then(() => {
      resolveSave!();
    });
  });
});
