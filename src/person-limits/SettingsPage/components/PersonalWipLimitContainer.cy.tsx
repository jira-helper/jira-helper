/// <reference types="cypress" />

/**
 * Cypress Component Tests for PersonalWipLimitContainer
 *
 * Tests migrated from PersonalWipLimitContainer.test.tsx (RTL) to Cypress.
 * All test cases (C1-C8, IssueTypeSelector, Save/Add, Count all) are preserved.
 */
import React from 'react';
import { globalContainer } from 'dioma';
import type { JiraUser } from 'src/shared/jiraApi';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { PersonalWipLimitContainer } from './PersonalWipLimitContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { PersonLimit } from '../state/types';
import type { PersonalWipLimitContainerProps } from './PersonalWipLimitContainer';

const WrappedContainer = (props: PersonalWipLimitContainerProps) => (
  <WithDi container={globalContainer}>
    <PersonalWipLimitContainer {...props} />
  </WithDi>
);

const mockSearchUsers = async (query: string): Promise<JiraUser[]> => [
  {
    name: query,
    displayName: query,
    avatarUrls: { '16x16': '', '32x32': '' },
    self: `https://jira.example.com/rest/api/2/user?username=${query}`,
  },
];

describe('PersonalWipLimitContainer - Bug fixes (C1-C8)', () => {
  const mockColumns = [
    { id: 'col1', name: 'To Do', isKanPlanColumn: false },
    { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
    { id: 'col3', name: 'Done', isKanPlanColumn: false },
  ];

  const mockSwimlanes = [
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
    useSettingsUIStore.setState(useSettingsUIStore.getInitialState());
  });

  describe('C1: Ввод в поле personName не переключает в режим Edit', () => {
    it('should keep Add limit button active when typing in personName field', () => {
      const onAddLimit = cy.stub().as('onAddLimit');
      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Type in the input
      cy.get('#edit-person-wip-limit-person-name').type('test.user');

      // Verify button is still "Add limit" and not disabled
      cy.contains('button', 'Add limit').should('be.visible').should('not.be.disabled');

      // Verify editingId is still null

      cy.then(() => {
        expect(useSettingsUIStore.getState().data.editingId).to.be.null;
      });
    });
  });

  describe('C2: Отжатие "All columns" показывает список', () => {
    it('should show column list when unchecking "All columns" and keep it visible', () => {
      const onAddLimit = cy.stub().as('onAddLimit');
      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Initially list should be hidden (all selected) - 3 checkboxes (IssueTypeSelector, All columns, All swimlanes)
      cy.get('input[type="checkbox"]').should('have.length.at.least', 3);

      // Find and uncheck "All columns" checkbox
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'All columns').click();

      // Wait for list to appear - should have more checkboxes
      cy.get('input[type="checkbox"]').should('have.length.at.least', 6); // IssueTypeSelector, All columns (unchecked), All swimlanes, col1, col2, col3

      // Wait a bit more to ensure list doesn't disappear
      cy.wait(500);

      // Verify list is still visible
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);
    });
  });

  describe('C3: Отжатие "All swimlanes" показывает список', () => {
    it('should show swimlanes list when unchecking "All swimlanes" and keep it visible', () => {
      const onAddLimit = cy.stub().as('onAddLimit');
      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Initially list should be hidden - 3 checkboxes (IssueTypeSelector, All columns, All swimlanes)
      cy.get('input[type="checkbox"]').should('have.length.at.least', 3);

      // Find and uncheck "All swimlanes" checkbox
      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'All swimlanes').click();

      // Wait for list to appear
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);

      // Wait a bit more to ensure list doesn't disappear
      cy.wait(500);

      // Verify list is still visible
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);
    });
  });

  describe('C4: Редактирование лимита с одной колонкой', () => {
    it('should show column list with one column selected when editing limit with partial columns', () => {
      const onAddLimit = cy.stub().as('onAddLimit');

      // Create a limit with only one column
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [{ id: 'col1', name: 'To Do' }], // Only one column
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Click Edit button
      cy.contains('button', 'Edit').click();

      // Wait for form to update - column list should be visible
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);

      // Find col1 checkbox and verify it's checked
      cy.contains('label', 'To Do').find('input[type="checkbox"]').should('be.checked');

      // Other columns should also be visible but unchecked
      cy.contains('label', 'In Progress').find('input[type="checkbox"]').should('not.be.checked');
    });
  });

  describe('C5: Редактирование лимита со всеми колонками', () => {
    it('should show "All columns" checked and hide list when editing limit with empty columns array (all)', () => {
      const onAddLimit = cy.stub().as('onAddLimit');

      // Empty array means "all columns"
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [], // empty = all columns
        swimlanes: [], // empty = all swimlanes
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Click Edit button
      cy.contains('button', 'Edit').click();

      // Wait for form to update
      cy.contains('button', 'Update limit').should('be.visible');

      // "All columns" should be checked
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');

      // Column list should be hidden - no checkboxes with column values visible
      // Should have only IssueTypeSelector (1), All columns (1), All swimlanes (1) = 3 checkboxes
      // But IssueTypeSelector might add more, so check that column-specific checkboxes are not visible
      cy.contains('label', 'To Do').should('not.exist');
      cy.contains('label', 'In Progress').should('not.exist');
      cy.contains('label', 'Done').should('not.exist');
    });
  });

  describe('C5b: Отключение "All columns" при редактировании лимита с пустыми массивами', () => {
    it('should allow unchecking "All columns" when editing limit with empty arrays', () => {
      const onAddLimit = cy.stub().as('onAddLimit');

      // Empty array means "all columns"
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [], // empty = all columns
        swimlanes: [], // empty = all swimlanes
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Click Edit button
      cy.contains('button', 'Edit').click();

      // Wait for form to update - "All columns" should be checked
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');

      // Uncheck "All columns"
      cy.contains('label', 'All columns').click();

      // Wait for list to appear and checkbox to be unchecked
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('not.be.checked');

      // List should be visible with all columns selected
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);

      // Wait a bit more to ensure it doesn't flicker back
      cy.wait(500);

      // Verify checkbox is still unchecked and list is still visible
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('not.be.checked');
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);
    });
  });

  describe('C6: Cancel отменяет редактирование', () => {
    it('should clear form and activate Add limit button when clicking Cancel', () => {
      const onAddLimit = cy.stub().as('onAddLimit');

      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [{ id: 'col1', name: 'To Do' }],
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Click Edit
      cy.contains('button', 'Edit').click();

      // Wait for edit mode
      cy.contains('button', 'Update limit').should('be.visible').should('not.be.disabled');

      // Click Cancel
      cy.contains('button', 'Cancel').click();

      // Wait for cancel to take effect

      cy.then(() => {
        // Verify editingId is cleared in store first
        expect(useSettingsUIStore.getState().data.editingId).to.be.null;
        expect(useSettingsUIStore.getState().data.formData).to.be.null;
      });

      // Then check button - single button should show "Add limit"
      cy.contains('button', 'Add limit').should('be.visible').should('not.be.disabled');

      // Form should be cleared
      cy.get('#edit-person-wip-limit-person-name').should('have.value', '');
    });
  });

  describe('C7: Выбор всех колонок скрывает список', () => {
    it('should hide column list when all columns are selected individually', () => {
      const onAddLimit = cy.stub().as('onAddLimit');
      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Uncheck "All columns" to show list
      cy.contains('label', 'All columns').click();

      // Wait for list to appear - should have more checkboxes
      cy.get('input[type="checkbox"]').should('have.length.at.least', 5);

      // Find and uncheck one column
      cy.contains('label', 'To Do').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'To Do').click();

      // Wait for it to be unchecked
      cy.contains('label', 'To Do').find('input[type="checkbox"]').should('not.be.checked');

      // Check it back - now all should be checked
      cy.contains('label', 'To Do').click();

      // Now all should be checked - list should hide
      cy.get('input[type="checkbox"]').should('have.length.at.most', 3);

      // "All columns" should be checked when list is hidden
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
    });
  });

  describe('C8: Снятие колонки в списке не скрывает список', () => {
    it('should keep column list visible when unchecking a column', () => {
      const onAddLimit = cy.stub().as('onAddLimit');
      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      // Uncheck "All columns" to show list
      cy.contains('label', 'All columns').click();

      // Wait for list to appear - should have more checkboxes
      cy.get('input[type="checkbox"]').should('have.length.at.least', 5);

      // Find and uncheck one column
      cy.contains('label', 'To Do').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'To Do').click();

      // Wait a bit
      cy.wait(300);

      // List should still be visible - should still have more than 3 checkboxes
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 3);

      // "All columns" should be unchecked
      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('not.be.checked');
    });
  });

  describe('IssueTypeSelector Integration', () => {
    describe('Issue types reset after add', () => {
      it('should reset issue types after adding a limit', () => {
        const onAddLimitMock = cy.stub().callsFake((formData: any) => {
          const mockPerson = {
            name: formData.person?.name || 'unknown',
            displayName: formData.person?.displayName || 'unknown',
            self: formData.person?.self || 'https://test.com/user',
            avatar: formData.person?.avatar || 'https://test.com/avatar.png',
          };

          const personLimit: PersonLimit = {
            id: Date.now(),
            person: mockPerson,
            limit: formData.limit,
            columns: [],
            swimlanes: [],
            ...(formData.includedIssueTypes && formData.includedIssueTypes.length > 0
              ? { includedIssueTypes: formData.includedIssueTypes }
              : {}),
          };

          useSettingsUIStore.getState().actions.addLimit(personLimit);
        });
        cy.wrap(onAddLimitMock).as('onAddLimit');

        cy.mount(
          <WrappedContainer
            columns={mockColumns}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimitMock}
          />
        );

        // Initially countAllTypes should be true (default)
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');

        // Uncheck to select specific types
        cy.contains('label', 'Count all issue types').click();
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');

        // Fill form and submit - need to select from dropdown
        cy.get('#edit-person-wip-limit-person-name').type('test.user');
        // Wait for dropdown and select the user
        cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click();
        cy.get('#edit-person-wip-limit-person-limit').clear().type('5');

        cy.contains('button', 'Add limit').click();

        cy.get('@onAddLimit').should('have.been.called');

        cy.then(() => {
          const store = useSettingsUIStore.getState();
          expect(store.data.formData).to.be.null;
          expect(store.data.editingId).to.be.null;
        });

        // All form fields should reset to defaults
        cy.get('#edit-person-wip-limit-person-name').should('have.value', '');
        cy.get('#edit-person-wip-limit-person-limit').should('have.value', '1');

        // Issue types should reset: "Count all issue types" must be checked again
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
      });
    });

    describe('Issue types populated when editing', () => {
      it('should populate issue types when editing a limit with includedIssueTypes', () => {
        const onAddLimit = cy.stub().as('onAddLimit');

        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
          includedIssueTypes: ['Task', 'Bug'],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);

        cy.mount(
          <WrappedContainer
            columns={mockColumns}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimit}
          />
        );

        // Click Edit button
        cy.contains('button', 'Edit').click();

        // Wait for edit mode
        cy.contains('button', 'Update limit').should('be.visible');

        // Wait for form to update with issue types
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');

        // Verify selected types are displayed - look for chips with Task and Bug
        // These appear in the "Selected issue types" section
        cy.contains('Task').should('be.visible');
        cy.contains('Bug').should('be.visible');
      });
    });

    describe('Issue types cleared when canceling edit', () => {
      it('should reset issue types when canceling edit', () => {
        const onAddLimit = cy.stub().as('onAddLimit');

        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [],
          swimlanes: [],
          includedIssueTypes: ['Task', 'Bug'],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);

        cy.mount(
          <WrappedContainer
            columns={mockColumns}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimit}
          />
        );

        // Click Edit button
        cy.contains('button', 'Edit').click();

        // Wait for edit mode - checkbox should be unchecked (has issue types)
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');

        // Click Cancel to exit edit mode
        cy.contains('button', 'Cancel').click();

        // Wait for add mode - checkbox should reset to checked
        cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
      });
    });
  });

  describe('Bug fixes: Save and Add limit', () => {
    describe('Save edited limit with specific columns', () => {
      it('should save selected columns correctly when editing (not save as "all")', () => {
        const onAddLimitMock = cy.stub().as('onAddLimit');

        // Create a limit with specific columns (not all)
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [
            { id: 'col1', name: 'To Do' },
            { id: 'col2', name: 'In Progress' },
          ], // Only 2 out of 3 columns
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);

        cy.mount(
          <WrappedContainer
            columns={mockColumns}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimitMock}
          />
        );

        // Click Edit button
        cy.contains('button', 'Edit').click();

        // Wait for edit mode
        cy.contains('button', 'Update limit').should('be.visible');

        // Submit the form
        cy.contains('button', 'Update limit').click();

        // Wait for onAddLimit to be called
        cy.get('@onAddLimit').should('have.been.called');

        // Verify that selectedColumns is NOT empty (should contain the 2 selected columns)

        cy.get<sinon.SinonStub>('@onAddLimit').then(stub => {
          const callArgs = stub.getCall(0).args[0];
          expect(callArgs.selectedColumns).to.not.be.empty;
          expect(callArgs.selectedColumns.length).to.be.greaterThan(0);
          // Should contain the column IDs that were selected
          expect(callArgs.selectedColumns).to.include('col1');
          expect(callArgs.selectedColumns).to.include('col2');
        });
      });

      it('should handle numeric column IDs from board API correctly', () => {
        const onAddLimitMock = cy.stub().as('onAddLimit');

        // Simulate board API returning numeric IDs
        const columnsWithNumericIds = [
          { id: '123', name: 'To Do' },
          { id: '456', name: 'In Progress' },
          { id: '789', name: 'Done' },
        ];

        // Create a limit with specific columns using numeric IDs as strings
        const limit: PersonLimit = {
          id: 1,
          person: {
            name: 'testuser',
            displayName: 'Test User',
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
          },
          limit: 5,
          columns: [
            { id: '123', name: 'To Do' },
            { id: '789', name: 'Done' },
          ], // Only 2 out of 3 columns
          swimlanes: [],
        };

        useSettingsUIStore.getState().actions.addLimit(limit);

        cy.mount(
          <WrappedContainer
            columns={columnsWithNumericIds}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimitMock}
          />
        );

        // Click Edit button
        cy.contains('button', 'Edit').click();

        // Wait for edit mode
        cy.contains('button', 'Update limit').should('be.visible');

        // Submit the form
        cy.contains('button', 'Update limit').click();

        // Wait for onAddLimit to be called
        cy.get('@onAddLimit').should('have.been.called');

        // Verify that selectedColumns contains the correct IDs

        cy.get<sinon.SinonStub>('@onAddLimit').then(stub => {
          const callArgs = stub.getCall(0).args[0];
          expect(callArgs.selectedColumns).to.not.be.empty;
          expect(callArgs.selectedColumns).to.include('123');
          expect(callArgs.selectedColumns).to.include('789');
        });
      });
    });

    describe('Add new limit', () => {
      it('should call onAddLimit with correct data when adding a new limit', () => {
        const onAddLimitMock = cy.stub().as('onAddLimit');

        cy.mount(
          <WrappedContainer
            columns={mockColumns}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimitMock}
          />
        );

        // Fill in the form - need to select from dropdown
        cy.get('#edit-person-wip-limit-person-name').type('newuser');
        cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click();
        cy.get('#edit-person-wip-limit-person-limit').clear().type('3');

        // Uncheck "All columns" to select specific columns
        cy.contains('label', 'All columns').click();

        // Wait for column list to appear
        cy.contains('label', 'To Do').should('be.visible');

        // Uncheck one column (so not all are selected)
        cy.contains('label', 'To Do').click();

        // Submit the form
        cy.contains('button', 'Add limit').click();

        // Wait for onAddLimit to be called
        cy.get('@onAddLimit').should('have.been.called');

        // Verify the call arguments

        cy.get<sinon.SinonStub>('@onAddLimit').then(stub => {
          const callArgs = stub.getCall(0).args[0];
          expect(callArgs.person?.name).to.eq('newuser');
          expect(callArgs.limit).to.eq(3);
          // Should have selected columns (not empty, not all)
          expect(callArgs.selectedColumns).to.not.be.empty;
          expect(callArgs.selectedColumns.length).to.be.lessThan(mockColumns.length);
        });
      });

      it('should handle form submission when all columns are selected', () => {
        const onAddLimitMock = cy.stub().as('onAddLimit');

        cy.mount(
          <WrappedContainer
            columns={mockColumns}
            swimlanes={mockSwimlanes}
            searchUsers={mockSearchUsers}
            onAddLimit={onAddLimitMock}
          />
        );

        // Fill in the form - need to select from dropdown
        cy.get('#edit-person-wip-limit-person-name').type('newuser');
        cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click();
        cy.get('#edit-person-wip-limit-person-limit').clear().type('5');

        // Submit with all columns selected (default state)
        cy.contains('button', 'Add limit').click();

        // Wait for onAddLimit to be called
        cy.get('@onAddLimit').should('have.been.called');

        // Verify the call arguments

        cy.get<sinon.SinonStub>('@onAddLimit').then(stub => {
          const callArgs = stub.getCall(0).args[0];
          expect(callArgs.person?.name).to.eq('newuser');
          expect(callArgs.limit).to.eq(5);
          // When all columns are selected, should save as empty array (meaning "all")
          expect(callArgs.selectedColumns).to.be.empty;
        });
      });
    });
  });

  describe('SC-EDIT-5a: Changing swimlane filter does not affect column filter', () => {
    it('should keep "All columns" checked when unchecking "All swimlanes" in edit mode', () => {
      const onAddLimit = cy.stub().as('onAddLimit');

      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'john.doe',
          displayName: 'John Doe',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      cy.contains('button', 'Edit').click();
      cy.contains('button', 'Update limit').should('be.visible');

      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');

      cy.contains('label', 'All swimlanes').click();

      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'To Do').should('not.exist');
      cy.contains('label', 'In Progress').should('not.exist');
      cy.contains('label', 'Done').should('not.exist');

      // Store's selectedColumns must stay [] (empty = all), not get replaced with explicit IDs
      cy.then(() => {
        const { formData: fd } = useSettingsUIStore.getState().data;
        expect(fd!.selectedColumns).to.deep.equal([]);
      });
    });

    it('should keep "All swimlanes" checked when unchecking "All columns" in edit mode', () => {
      const onAddLimit = cy.stub().as('onAddLimit');

      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'john.doe',
          displayName: 'John Doe',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimit}
        />
      );

      cy.contains('button', 'Edit').click();
      cy.contains('button', 'Update limit').should('be.visible');

      cy.contains('label', 'All columns').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');

      cy.contains('label', 'All columns').click();

      cy.contains('label', 'All swimlanes').find('input[type="checkbox"]').should('be.checked');
      cy.contains('label', 'Frontend').should('not.exist');
      cy.contains('label', 'Backend').should('not.exist');

      // Store's swimlanes must stay [] (empty = all), not get replaced with explicit IDs
      cy.then(() => {
        const { formData: fd } = useSettingsUIStore.getState().data;
        expect(fd!.swimlanes).to.deep.equal([]);
      });
    });
  });

  describe('Bug fix: Count all issue types checkbox', () => {
    it('should stay unchecked when user unchecks it in add new limit mode', () => {
      const onAddLimitMock = cy.stub().as('onAddLimit');

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimitMock}
        />
      );

      // Initially checkbox should be checked (default state)
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');

      // User unchecks the checkbox
      cy.contains('label', 'Count all issue types').click();

      // The checkbox should stay unchecked (not reset back to checked)
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');

      // Verify it's still unchecked after a short delay (to catch any delayed resets)
      cy.wait(100);
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');
    });

    it('should reset to checked when switching from edit mode to add mode', () => {
      const onAddLimitMock = cy.stub().as('onAddLimit');

      // Create a limit with issue types
      const limit: PersonLimit = {
        id: 1,
        person: {
          name: 'testuser',
          displayName: 'Test User',
          self: 'https://test.com/user',
          avatar: 'https://test.com/avatar.png',
        },
        limit: 5,
        columns: [],
        swimlanes: [],
        includedIssueTypes: ['Task', 'Bug'],
      };

      useSettingsUIStore.getState().actions.addLimit(limit);

      cy.mount(
        <WrappedContainer
          columns={mockColumns}
          swimlanes={mockSwimlanes}
          searchUsers={mockSearchUsers}
          onAddLimit={onAddLimitMock}
        />
      );

      // Click Edit button
      cy.contains('button', 'Edit').click();

      // Wait for edit mode - checkbox should be unchecked (has issue types)
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('not.be.checked');

      // Click Cancel to exit edit mode
      cy.contains('button', 'Cancel').click();

      // Wait for add mode - checkbox should reset to checked
      cy.contains('label', 'Count all issue types').find('input[type="checkbox"]').should('be.checked');
    });
  });
});
