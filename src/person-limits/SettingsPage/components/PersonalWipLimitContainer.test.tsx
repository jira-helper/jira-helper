import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonalWipLimitContainer } from './PersonalWipLimitContainer';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { PersonLimit } from '../state/types';

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string; ru: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

// Mock IssueTypeSelector - now with proper prop sync
vi.mock('../../../shared/components/IssueTypeSelector', () => ({
  IssueTypeSelector: ({ groupId, onSelectionChange, selectedTypes, initialCountAllTypes }: any) => {
    // Use state to track checkbox, but sync with props (mimicking real component behavior)
    const [countAll, setCountAll] = React.useState(initialCountAllTypes ?? true);
    const [types, setTypes] = React.useState(selectedTypes ?? []);

    // Sync with prop changes - this mimics the useEffect we added to the real component
    React.useEffect(() => {
      setCountAll(initialCountAllTypes ?? true);
    }, [initialCountAllTypes]);

    React.useEffect(() => {
      setTypes(selectedTypes ?? []);
    }, [selectedTypes]);

    return (
      <div data-testid={`issue-type-selector-${groupId}`}>
        <input
          type="checkbox"
          data-testid="count-all-types"
          checked={countAll}
          onChange={(e) => {
            const newCountAll = e.target.checked;
            setCountAll(newCountAll);
            // When checking, pass empty array and true
            // When unchecking, pass current types (or empty if none) and false
            onSelectionChange(newCountAll ? [] : (types.length > 0 ? types : []), newCountAll);
          }}
        />
        {!countAll && types.length > 0 && (
          <div data-testid="selected-types">
            {types.join(', ')}
          </div>
        )}
      </div>
    );
  },
}));

// Mock PersonalWipLimitTable
vi.mock('./PersonalWipLimitTable', () => ({
  PersonalWipLimitTable: ({ limits, onDelete, onEdit, onCheckboxChange, checkedIds }: any) => (
    <div data-testid="personal-wip-limit-table">
      {limits.map((limit: PersonLimit) => (
        <div key={limit.id} data-testid={`limit-row-${limit.id}`}>
          <button
            data-testid={`edit-button-${limit.id}`}
            onClick={() => onEdit(limit.id)}
          >
            Edit
          </button>
          <button
            data-testid={`delete-button-${limit.id}`}
            onClick={() => onDelete(limit.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

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

  const mockOnAddLimit = vi.fn();

  beforeEach(() => {
    // Reset store to initial state
    useSettingsUIStore.setState(useSettingsUIStore.getInitialState());
    mockOnAddLimit.mockClear();
  });

  describe('C1: Ввод в поле personName не переключает в режим Edit', () => {
    it('should keep Add limit button active when typing in personName field', async () => {
      const user = userEvent.setup();
      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Use id selector for Ant Design input
      const personNameInput = document.getElementById('edit-person-wip-limit-person-name') as HTMLInputElement;
      const saveButton = screen.getByText('Add limit').closest('button') as HTMLButtonElement;

      // Type in the input
      await user.type(personNameInput, 'test.user');

      // Wait for any state updates
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
        expect(saveButton).toHaveTextContent('Add limit');
        // Verify editingId is still null
        expect(useSettingsUIStore.getState().data.editingId).toBeNull();
      });
    });
  });

  describe('C2: Отжатие "All columns" показывает список', () => {
    it('should show column list when unchecking "All columns" and keep it visible', async () => {
      const user = userEvent.setup();
      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Find "All columns" checkbox by finding the label and then the input
      const allColumnsLabel = screen.getByText('All columns');
      const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(allColumnsCheckbox).toBeInTheDocument();
      expect(allColumnsCheckbox.checked).toBe(true);
      
      // Initially list should be hidden (all selected) - 3 checkboxes (IssueTypeSelector, All columns, All swimlanes)
      const initialCheckboxes = screen.getAllByRole('checkbox');
      expect(initialCheckboxes.length).toBe(3);

      // Uncheck "All columns" - find the Ant Design Checkbox component and trigger its onChange
      // Ant Design Checkbox uses a wrapper, so we need to find the actual checkbox element
      // and simulate a click which will trigger the onChange
      const checkboxWrapper = allColumnsLabel.closest('.ant-checkbox-wrapper');
      if (checkboxWrapper) {
        fireEvent.click(checkboxWrapper);
      } else {
        // Fallback: click directly on the input
        fireEvent.click(allColumnsCheckbox);
      }

      // Wait for list to appear - checkboxes should be visible
      await waitFor(() => {
        // After unchecking "All", we should have more checkboxes (the individual ones)
        // Should have: IssueTypeSelector, All columns (unchecked), All swimlanes, col1, col2, col3 = 6
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBe(6);
      }, { timeout: 3000 });

      // Wait a bit more to ensure list doesn't disappear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify list is still visible - should still have more than 3 checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(3);
    });
  });

  describe('C3: Отжатие "All swimlanes" показывает список', () => {
    it('should show swimlanes list when unchecking "All swimlanes" and keep it visible', async () => {
      const user = userEvent.setup();
      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Find "All swimlanes" checkbox
      const allSwimlanesLabel = screen.getByText('All swimlanes');
      const allSwimlanesCheckbox = allSwimlanesLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(allSwimlanesCheckbox).toBeInTheDocument();
      
      // Initially list should be hidden - 3 checkboxes (IssueTypeSelector, All columns, All swimlanes)
      const initialCheckboxes = screen.getAllByRole('checkbox');
      expect(initialCheckboxes.length).toBe(3);

      // Uncheck "All swimlanes" - find the Ant Design Checkbox component and trigger its onChange
      const swimlaneCheckboxWrapper = allSwimlanesLabel.closest('.ant-checkbox-wrapper');
      if (swimlaneCheckboxWrapper) {
        fireEvent.click(swimlaneCheckboxWrapper);
      } else {
        // Fallback: click directly on the input
        fireEvent.click(allSwimlanesCheckbox);
      }

      // Wait for list to appear
      await waitFor(() => {
        // After unchecking All swimlanes, we should have more checkboxes (individual swimlane checkboxes)
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(3);
      }, { timeout: 3000 });

      // Wait a bit more to ensure list doesn't disappear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify list is still visible - should still have more than 3 checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(3);
    });
  });

  describe('C4: Редактирование лимита с одной колонкой', () => {
    it('should show column list with one column selected when editing limit with partial columns', async () => {
      const user = userEvent.setup();
      
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

      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Click Edit button
      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      // Wait for form to update
      await waitFor(() => {
        // Column list should be visible - find by value
        const checkboxes = screen.getAllByRole('checkbox');
        const col1Checkbox = checkboxes.find(cb => cb.getAttribute('value') === 'col1');
        expect(col1Checkbox).toBeInTheDocument();
        expect(col1Checkbox).toBeChecked();

        // Other columns should also be visible but unchecked
        const col2Checkbox = checkboxes.find(cb => cb.getAttribute('value') === 'col2');
        expect(col2Checkbox).toBeInTheDocument();
        expect(col2Checkbox).not.toBeChecked();
      });
    });
  });

  describe('C5: Редактирование лимита со всеми колонками', () => {
    it('should show "All columns" checked and hide list when editing limit with empty columns array (all)', async () => {
      const user = userEvent.setup();
      
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

      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Click Edit button
      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      // Wait for form to update
      await waitFor(() => {
        // "All columns" should be checked
        const allColumnsLabel = screen.getByText('All columns');
        const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(allColumnsCheckbox).toBeChecked();

        // Column list should be hidden - no checkboxes with column values
        const checkboxes = screen.getAllByRole('checkbox');
        const columnCheckboxes = checkboxes.filter(cb => ['col1', 'col2', 'col3'].includes(cb.getAttribute('value') || ''));
        expect(columnCheckboxes.length).toBe(0);
      });
    });
  });

  describe('C5b: Отключение "All columns" при редактировании лимита с пустыми массивами', () => {
    it('should allow unchecking "All columns" when editing limit with empty arrays', async () => {
      const user = userEvent.setup();
      
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

      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Click Edit button
      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      // Wait for form to update - "All columns" should be checked
      await waitFor(() => {
        const allColumnsLabel = screen.getByText('All columns');
        const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(allColumnsCheckbox).toBeChecked();
      });

      // Uncheck "All columns"
      const allColumnsLabel = screen.getByText('All columns');
      const checkboxWrapper = allColumnsLabel.closest('.ant-checkbox-wrapper');
      if (checkboxWrapper) {
        fireEvent.click(checkboxWrapper);
      } else {
        const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        fireEvent.click(allColumnsCheckbox);
      }

      // Wait for list to appear and checkbox to be unchecked
      await waitFor(() => {
        const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(allColumnsCheckbox).not.toBeChecked();
        
        // List should be visible with all columns selected
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(3); // Should have individual column checkboxes
      }, { timeout: 3000 });

      // Wait a bit more to ensure it doesn't flicker back
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify checkbox is still unchecked and list is still visible
      const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(allColumnsCheckbox).not.toBeChecked();
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(3);
    });
  });

  describe('C6: Cancel отменяет редактирование', () => {
    it('should clear form and activate Add limit button when clicking Cancel', async () => {
      const user = userEvent.setup();
      
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

      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Click Edit
      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      // Wait for edit mode
      await waitFor(() => {
        const saveButton = screen.getByText('Edit limit').closest('button') as HTMLButtonElement;
        expect(saveButton).not.toBeDisabled();
        expect(saveButton).toHaveTextContent('Edit limit');
      });

      // Click Cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Wait for cancel to take effect
      await waitFor(() => {
        // Verify editingId is cleared in store first
        expect(useSettingsUIStore.getState().data.editingId).toBeNull();
        expect(useSettingsUIStore.getState().data.formData).toBeNull();
      });

      // Then check button - single button should show "Add limit"
      await waitFor(() => {
        const saveButton = screen.getByText('Add limit').closest('button') as HTMLButtonElement;
        expect(saveButton).not.toBeDisabled();
        expect(saveButton).toHaveTextContent('Add limit');
        
        // Form should be cleared
        const personNameInput = document.getElementById('edit-person-wip-limit-person-name') as HTMLInputElement;
        expect(personNameInput.value).toBe('');
      });
    });
  });

  describe('C7: Выбор всех колонок скрывает список', () => {
    it('should hide column list when all columns are selected individually', async () => {
      const user = userEvent.setup();
      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Uncheck "All columns" to show list
      const allColumnsLabel = screen.getByText('All columns');
      const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const checkboxWrapper = allColumnsLabel.closest('.ant-checkbox-wrapper');
      if (checkboxWrapper) {
        fireEvent.click(checkboxWrapper);
      } else {
        fireEvent.click(allColumnsCheckbox);
      }

      // Wait for list to appear - should have more checkboxes
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        // Should have All columns, All swimlanes, and 3 column checkboxes = 5
        expect(checkboxes.length).toBeGreaterThanOrEqual(5);
      }, { timeout: 2000 });

      // Find and uncheck one column - get all checkboxes and find the one that's not "All"
      const checkboxes = screen.getAllByRole('checkbox');
      // Find a checkbox that's not the "All columns" or "All swimlanes" checkbox
      // These should be the individual column checkboxes
      const columnCheckboxes = checkboxes.filter(cb => {
        const value = cb.getAttribute('value');
        return value && ['col1', 'col2', 'col3'].includes(value);
      });
      expect(columnCheckboxes.length).toBeGreaterThan(0);
      
      const col1Checkbox = columnCheckboxes[0] as HTMLInputElement;
      const wasChecked = col1Checkbox.checked;
      
      // If it's already checked, we need to uncheck it first, then check it back
      // to simulate the scenario where user unchecks and then checks all
      if (wasChecked) {
        // Uncheck it
        await user.click(col1Checkbox);
        await waitFor(() => {
          expect(col1Checkbox).not.toBeChecked();
        });
        // Check it back - now all should be checked
        await user.click(col1Checkbox);
      } else {
        // It was unchecked, just check it
        await user.click(col1Checkbox);
      }

      // Now all should be checked - list should hide
      // The component should automatically hide the list when all columns are selected
      await waitFor(() => {
        // List should be hidden - should have only 3 checkboxes (IssueTypeSelector, All columns, All swimlanes)
        const allCheckboxes = screen.getAllByRole('checkbox');
        expect(allCheckboxes.length).toBeLessThanOrEqual(3);
        
        // Re-find the checkbox as it may have been re-rendered
        const allColumnsLabelAfter = screen.getByText('All columns');
        const allColumnsCheckboxAfter = allColumnsLabelAfter.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        // "All columns" should be checked when list is hidden
        if (allCheckboxes.length <= 3) {
          expect(allColumnsCheckboxAfter).toBeChecked();
        }
      }, { timeout: 3000 });
    });
  });

  describe('C8: Снятие колонки в списке не скрывает список', () => {
    it('should keep column list visible when unchecking a column', async () => {
      const user = userEvent.setup();
      render(
        <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
      );

      // Uncheck "All columns" to show list
      const allColumnsLabel = screen.getByText('All columns');
      const allColumnsCheckbox = allColumnsLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const checkboxWrapper = allColumnsLabel.closest('.ant-checkbox-wrapper');
      if (checkboxWrapper) {
        fireEvent.click(checkboxWrapper);
      } else {
        fireEvent.click(allColumnsCheckbox);
      }

      // Wait for list to appear - should have more checkboxes
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        // Should have All columns, All swimlanes, and 3 column checkboxes = 5
        expect(checkboxes.length).toBeGreaterThanOrEqual(5);
      }, { timeout: 2000 });

      // Find and uncheck one column
      let checkboxes = screen.getAllByRole('checkbox');
      const columnCheckboxes = checkboxes.filter(cb => {
        const value = cb.getAttribute('value');
        return value && ['col1', 'col2', 'col3'].includes(value);
      });
      expect(columnCheckboxes.length).toBe(3);
      
      const col1Checkbox = columnCheckboxes[0] as HTMLInputElement;
      await user.click(col1Checkbox);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 300));

      // List should still be visible - should still have more than 3 checkboxes
      checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(3);

      // "All columns" should be unchecked
      expect(allColumnsCheckbox).not.toBeChecked();
    });
  });

  describe('IssueTypeSelector Integration', () => {
    describe('Issue types reset after add', () => {
      it('should reset issue types after adding a limit', async () => {
        const user = userEvent.setup();
        
        // Create a mock that actually adds to store
        const onAddLimitMock = vi.fn(async (formData: FormData) => {
          // Simulate what index.tsx does - add limit to store
          const mockPerson = {
            name: formData.personName,
            displayName: formData.personName,
            self: 'https://test.com/user',
            avatar: 'https://test.com/avatar.png',
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
        
        render(
          <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={onAddLimitMock} />
        );

        // Initially countAllTypes should be true (default)
        let countAllTypesCheckbox = screen.getByTestId('count-all-types');
        expect(countAllTypesCheckbox).toBeChecked();

        // Uncheck to select specific types
        await user.click(countAllTypesCheckbox);

        // Fill form and submit
        const personNameInput = document.getElementById('edit-person-wip-limit-person-name') as HTMLInputElement;
        await user.type(personNameInput, 'test.user');
        
        const limitInput = document.getElementById('edit-person-wip-limit-person-limit') as HTMLInputElement;
        await user.clear(limitInput);
        await user.type(limitInput, '5');

        // Submit form - this will call onAddLimit which should add the limit to store
        const saveButton = screen.getByText('Add limit').closest('button') as HTMLButtonElement;
        await user.click(saveButton);

        // Wait for store to update (addLimit clears formData)
        await waitFor(() => {
          const store = useSettingsUIStore.getState();
          expect(store.data.formData).toBeNull();
          expect(store.data.editingId).toBeNull();
        });

        // Wait for form to reset
        await waitFor(() => {
          // Verify form is cleared
          const personNameInputAfter = document.getElementById('edit-person-wip-limit-person-name') as HTMLInputElement;
          expect(personNameInputAfter.value).toBe('');
        });

        // The component's useEffect should have reset countAllTypes to true when editingId is null
        // This gets passed to IssueTypeSelector as initialCountAllTypes
        // The mock should sync with this prop change via useEffect
        await waitFor(() => {
          const countAllTypesCheckboxAfter = screen.getByTestId('count-all-types');
          // After useEffect runs (editingId === null), countAllTypes should be true
          // This should be passed to mock as initialCountAllTypes=true
          expect(countAllTypesCheckboxAfter).toBeChecked();
        }, { timeout: 2000 });
      });
    });

    describe('Issue types populated when editing', () => {
      it('should populate issue types when editing a limit with includedIssueTypes', async () => {
        const user = userEvent.setup();
        
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

        render(
          <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
        );

        // Click Edit button
        const editButton = screen.getByTestId('edit-button-1');
        await user.click(editButton);

        // Wait for form to update with issue types
        // setEditingId should populate formData.includedIssueTypes
        // useEffect should update selectedTypes and countAllTypes
        // IssueTypeSelector should receive updated props and sync
        await waitFor(() => {
          // Verify IssueTypeSelector receives correct props
          // countAllTypes should be false when types are selected
          const countAllTypesCheckbox = screen.getByTestId('count-all-types');
          expect(countAllTypesCheckbox).not.toBeChecked();
          
          // Verify selected types are displayed
          const selectedTypesDiv = screen.getByTestId('selected-types');
          expect(selectedTypesDiv.textContent).toContain('Task');
          expect(selectedTypesDiv.textContent).toContain('Bug');
        }, { timeout: 2000 });
      });
    });

    describe('Issue types cleared when canceling edit', () => {
      it('should reset issue types when canceling edit', async () => {
        const user = userEvent.setup();
        
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

        render(
          <PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={mockOnAddLimit} />
        );

        // Click Edit button
        const editButton = screen.getByTestId('edit-button-1');
        await user.click(editButton);

        // Wait for edit mode
        await waitFor(() => {
          const saveButton = screen.getByText('Edit limit').closest('button') as HTMLButtonElement;
          expect(saveButton).toBeInTheDocument();
        });

        // Click Cancel
        const cancelButton = screen.getByText('Cancel');
        await user.click(cancelButton);

        // Wait for cancel to take effect
        await waitFor(() => {
          // Verify editingId is cleared
          expect(useSettingsUIStore.getState().data.editingId).toBeNull();
          
          // Verify issue types are reset to default (countAllTypes = true)
          const countAllTypesCheckbox = screen.getByTestId('count-all-types');
          expect(countAllTypesCheckbox).toBeChecked();
        });
      });
    });
  });
});
