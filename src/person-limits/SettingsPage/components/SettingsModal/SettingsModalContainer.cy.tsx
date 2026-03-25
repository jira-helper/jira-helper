/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsModalContainer
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { issueTypeServiceToken, type IIssueTypeService } from 'src/shared/issueType';
import { SettingsModalContainer } from './SettingsModalContainer';
import { useSettingsUIStore } from '../../stores/settingsUIStore';
import type { Column, Swimlane } from '../../state/types';

const mockSearchUsers = async () => [];

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
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
    globalContainer.register({
      token: routingServiceToken,
      value: { getProjectKeyFromURL: () => 'TEST' } as unknown as IRoutingService,
    });
    globalContainer.register({
      token: issueTypeServiceToken,
      value: { loadForProject: async () => [], clearCache: () => {} } as IIssueTypeService,
    });
    useSettingsUIStore.getState().actions.reset();
  });

  it('should render modal with PersonalWipLimitContainer inside', () => {
    const onClose = cy.stub();
    cy.wrap(onClose).as('onClose');
    const onSave = cy.stub().resolves();
    cy.wrap(onSave).as('onSave');

    cy.mount(
      <WithDi container={globalContainer}>
        <SettingsModalContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={mockSearchUsers}
          onClose={onClose}
          onSave={onSave}
        />
      </WithDi>
    );

    cy.contains('Personal WIP Limit').should('be.visible');
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should call onClose when Cancel is clicked', () => {
    const onClose = cy.stub();
    cy.wrap(onClose).as('onClose');
    const onSave = cy.stub().resolves();
    cy.wrap(onSave).as('onSave');

    cy.mount(
      <WithDi container={globalContainer}>
        <SettingsModalContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={mockSearchUsers}
          onClose={onClose}
          onSave={onSave}
        />
      </WithDi>
    );

    cy.contains('button', 'Cancel').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('should call onSave when Save is clicked', () => {
    const onClose = cy.stub();
    cy.wrap(onClose).as('onClose');
    const onSave = cy.stub().resolves();
    cy.wrap(onSave).as('onSave');

    cy.mount(
      <WithDi container={globalContainer}>
        <SettingsModalContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={mockSearchUsers}
          onClose={onClose}
          onSave={onSave}
        />
      </WithDi>
    );

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');
  });

  it('should show loading state while saving', () => {
    const onClose = cy.stub();
    cy.wrap(onClose).as('onClose');
    let resolveSave: () => void;
    const onSave = cy.stub().returns(
      new Promise<void>(resolve => {
        resolveSave = resolve;
      })
    );
    cy.wrap(onSave).as('onSave');

    cy.mount(
      <WithDi container={globalContainer}>
        <SettingsModalContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={mockSearchUsers}
          onClose={onClose}
          onSave={onSave}
        />
      </WithDi>
    );

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');

    cy.contains('button', 'Save').should('have.attr', 'class').and('include', 'ant-btn-loading');

    cy.then(() => {
      resolveSave!();
    });
  });

  it('should disable Cancel button while saving', () => {
    const onClose = cy.stub();
    cy.wrap(onClose).as('onClose');
    let resolveSave: () => void;
    const onSave = cy.stub().returns(
      new Promise<void>(resolve => {
        resolveSave = resolve;
      })
    );
    cy.wrap(onSave).as('onSave');

    cy.mount(
      <WithDi container={globalContainer}>
        <SettingsModalContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={mockSearchUsers}
          onClose={onClose}
          onSave={onSave}
        />
      </WithDi>
    );

    cy.contains('button', 'Save').click();
    cy.get('@onSave').should('have.been.calledOnce');

    cy.contains('button', 'Cancel').should('be.disabled');

    cy.then(() => {
      resolveSave!();
    });
  });
});
