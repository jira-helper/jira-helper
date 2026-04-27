/// <reference types="cypress" />
/**
 * Cypress Component Tests for SettingsModalContainer
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { routingServiceToken, type IRoutingService } from 'src/infrastructure/routing';
import { issueTypeServiceToken, type IIssueTypeService } from 'src/shared/issueType';
import { BoardPropertyServiceToken, type BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { SettingsModalContainer } from './SettingsModalContainer';
import type { Column, Swimlane } from '../../state/types';
import type { PersonLimit } from '../../../property/types';
import { personLimitsModule } from '../../../module';
import { propertyModelToken, settingsUIModelToken } from '../../../tokens';

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
    globalContainer.register({
      token: BoardPropertyServiceToken,
      value: {
        getBoardProperty: async () => ({ limits: [] }),
        updateBoardProperty: () => {},
        deleteBoardProperty: () => {},
      } as unknown as BoardPropertyServiceI,
    });
    personLimitsModule.ensure(globalContainer);
    globalContainer.inject(propertyModelToken).model.setData({ limits: [] });
    globalContainer.inject(settingsUIModelToken).model.reset();
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
    cy.get('[role="dialog"]').scrollIntoView().should('be.visible');
  });

  it('should keep personal limits table contained within the modal width', () => {
    const wideLimit: PersonLimit = {
      id: 1,
      persons: [
        { name: 'john.doe', displayName: 'John Doe', self: 'https://jira.example.com/user?username=john.doe' },
        { name: 'jane.smith', displayName: 'Jane Smith', self: 'https://jira.example.com/user?username=jane.smith' },
      ],
      limit: 5,
      columns: [
        { id: 'col1', name: 'Very Long Column Name - Discovery And Analysis' },
        { id: 'col2', name: 'Very Long Column Name - Implementation In Progress' },
      ],
      swimlanes: [
        { id: 'swim1', name: 'Frontend Platform And UI' },
        { id: 'swim2', name: 'Backend Services And Integrations' },
      ],
      includedIssueTypes: ['Story', 'Bug', 'Tech Debt'],
      showAllPersonIssues: true,
      sharedLimit: true,
    };
    globalContainer.inject(propertyModelToken).model.setData({ limits: [wideLimit] });
    globalContainer.inject(settingsUIModelToken).model.initFromProperty();

    cy.mount(
      <WithDi container={globalContainer}>
        <SettingsModalContainer
          columns={columns}
          swimlanes={swimlanes}
          searchUsers={mockSearchUsers}
          onClose={() => {}}
          onSave={async () => {}}
        />
      </WithDi>
    );

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#edit-person-wip-limit-persons-limit-body').should('be.visible');

    cy.get('[role="dialog"]').then($dialog => {
      const modalRect = $dialog[0].getBoundingClientRect();
      cy.get('#edit-person-wip-limit-persons-limit-body')
        .closest('.ant-table-wrapper')
        .then($tableWrapper => {
          const tableRect = $tableWrapper[0].getBoundingClientRect();
          expect(tableRect.left).to.be.greaterThan(modalRect.left - 1);
          expect(tableRect.right).to.be.lessThan(modalRect.right + 1);
          expect($tableWrapper[0].scrollWidth).to.be.lessThan($tableWrapper[0].clientWidth + 1);
        });
    });
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
