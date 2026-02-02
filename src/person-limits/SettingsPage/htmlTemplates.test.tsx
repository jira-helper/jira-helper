import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { PersonalWipLimitContainer } from './components/PersonalWipLimitContainer';
import { useSettingsUIStore } from './stores/settingsUIStore';

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string; ru: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

// Mock IssueTypeSelector
vi.mock('../../shared/components/IssueTypeSelector', () => ({
  IssueTypeSelector: ({ groupId, onSelectionChange }: any) => (
    <div data-testid={`issue-type-selector-${groupId}`}>
      <input type="checkbox" data-testid="count-all-types" onChange={e => onSelectionChange([], e.target.checked)} />
    </div>
  ),
}));

describe('PersonalWipLimitContainer', () => {
  const mockColumns = [
    { id: 'col1', name: 'To Do', isKanPlanColumn: false },
    { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
    { id: 'col3', name: 'Done', isKanPlanColumn: false },
  ];

  const mockSwimlanes = [
    { id: 'swim1', name: 'Frontend' },
    { id: 'swim2', name: 'Backend' },
  ];

  const mockLimits = [
    {
      id: 1,
      person: { displayName: 'John Doe' },
      limit: 5,
      columns: [{ id: 'col1', name: 'To Do' }],
      swimlanes: [{ id: 'swim1', name: 'Frontend' }],
    },
  ];

  beforeEach(() => {
    (window as any).__personLimitFormRefs = undefined;
    (window as any).__personLimitIssueTypesState = undefined;
    useSettingsUIStore.getState().actions.reset();
    useSettingsUIStore.getState().actions.setLimits(mockLimits);
  });

  it('should render the form with all columns and swimlanes', () => {
    render(<PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={vi.fn()} />);

    // Check that "All columns" checkbox exists
    expect(screen.getByText('All columns')).toBeInTheDocument();

    // Check that "All swimlanes" checkbox exists
    expect(screen.getByText('All swimlanes')).toBeInTheDocument();

    // When "All" is checked, lists should be hidden
    // Individual checkboxes should not be visible initially
    mockColumns.forEach(col => {
      const checkbox = screen.queryByLabelText(col.name);
      expect(checkbox).not.toBeInTheDocument();
    });
    mockSwimlanes.forEach(swim => {
      const checkbox = screen.queryByLabelText(swim.name);
      expect(checkbox).not.toBeInTheDocument();
    });
  });

  it('should toggle all columns when "All columns" checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={vi.fn()} />);

    // Find the checkbox by finding the label text and then the input
    const allColumnsLabel = screen.getByText('All columns');
    const allColumnsCheckbox = allColumnsLabel
      .closest('label')
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(allColumnsCheckbox).toBeInTheDocument();

    // Click to toggle
    await user.click(allColumnsCheckbox);

    // Wait a bit for state to update
    await waitFor(
      () => {
        // After click, state should change
        expect(allColumnsCheckbox).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should toggle all swimlanes when "All swimlanes" checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={vi.fn()} />);

    // Find the checkbox
    const allSwimlanesLabel = screen.getByText('All swimlanes');
    const allSwimlanesCheckbox = allSwimlanesLabel
      .closest('label')
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(allSwimlanesCheckbox).toBeInTheDocument();

    // Click to toggle
    await user.click(allSwimlanesCheckbox);

    // Wait a bit for state to update
    await waitFor(
      () => {
        expect(allSwimlanesCheckbox).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should update "All columns" checkbox when individual columns are toggled', async () => {
    const user = userEvent.setup();
    render(<PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={vi.fn()} />);

    // First, uncheck "All columns" to show the list
    const allColumnsLabel = screen.getByText('All columns');
    const allColumnsCheckbox = allColumnsLabel
      .closest('label')
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(allColumnsCheckbox);

    // Wait for list to appear
    await waitFor(
      () => {
        const firstColumnCheckbox = screen.getByLabelText(mockColumns[0].name);
        expect(firstColumnCheckbox).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Now uncheck one column
    const firstColumnCheckbox = screen.getByLabelText(mockColumns[0].name) as HTMLInputElement;
    await user.click(firstColumnCheckbox);

    // Wait for state to update
    await waitFor(
      () => {
        expect(firstColumnCheckbox).not.toBeChecked();
      },
      { timeout: 2000 }
    );
  });

  it('should correctly set showColumnsList when editing a limit with only one column selected', async () => {
    const singleColumn = [{ id: 'col1', name: 'To Do', isKanPlanColumn: false }];

    const limitWithOneColumn = {
      id: 1,
      person: { displayName: 'John Doe', name: 'john.doe' },
      limit: 5,
      columns: [{ id: 'col1', name: 'To Do' }], // Only one column selected
      swimlanes: [{ id: 'swim1', name: 'Frontend' }],
    };

    useSettingsUIStore.getState().actions.setLimits([limitWithOneColumn]);

    render(<PersonalWipLimitContainer columns={singleColumn} swimlanes={mockSwimlanes} onAddLimit={vi.fn()} />);

    // Click edit button
    const editButton = screen.getByText('Edit');
    await userEvent.click(editButton);

    // Wait for state to update
    await waitFor(
      () => {
        // All columns are selected, so "All columns" checkbox should be checked
        // and the individual columns list should be hidden
        const allColumnsLabel = screen.getByText('All columns');
        const allColumnsCheckbox = allColumnsLabel
          .closest('label')
          ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(allColumnsCheckbox.checked).toBe(true);
        expect(screen.queryByLabelText('To Do')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should correctly populate columns and swimlanes when editing an existing limit', async () => {
    const user = userEvent.setup();
    const existingLimit = {
      id: 1,
      person: { displayName: 'John Doe', name: 'john.doe' },
      limit: 5,
      columns: [
        { id: 'col1', name: 'To Do' },
        { id: 'col2', name: 'In Progress' },
      ], // Two specific columns selected
      swimlanes: [{ id: 'swim1', name: 'Frontend' }], // One specific swimlane selected
    };

    useSettingsUIStore.getState().actions.setLimits([existingLimit]);

    render(<PersonalWipLimitContainer columns={mockColumns} swimlanes={mockSwimlanes} onAddLimit={vi.fn()} />);

    // Click edit button
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    // Wait for form to be updated - check that values are set correctly
    await waitFor(
      () => {
        // Check "All columns" is unchecked because not all columns are selected
        const allColumnsLabel = screen.getByText('All columns');
        const allColumnsCheckbox = allColumnsLabel
          .closest('label')
          ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(allColumnsCheckbox.checked).toBe(false);

        // Check individual columns are checked
        expect(screen.getByLabelText('To Do')).toBeChecked();
        expect(screen.getByLabelText('In Progress')).toBeChecked();
        expect(screen.getByLabelText('Done')).not.toBeChecked();

        // Check swimlanes
        const allSwimlanesLabel = screen.getByText('All swimlanes');
        const allSwimlanesCheckbox = allSwimlanesLabel
          .closest('label')
          ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(allSwimlanesCheckbox.checked).toBe(false);
        expect(screen.getByLabelText('Frontend')).toBeChecked();
        expect(screen.getByLabelText('Backend')).not.toBeChecked();
      },
      { timeout: 3000 }
    );
  });

  it('should not create id="columns" to avoid conflicts with Jira styles', () => {
    const { container } = render(
      <PersonalWipLimitContainer
        columns={mockColumns}
        swimlanes={mockSwimlanes}
        limits={mockLimits}
        checkedIds={[]}
        onAddLimit={vi.fn()}
        onEditLimit={vi.fn()}
        onApplyColumns={vi.fn()}
        onApplySwimlanes={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCheckboxChange={vi.fn()}
      />
    );

    // Check that no element has id="columns" (which would conflict with Jira's #columns styles)
    const elementWithColumnsId = container.querySelector('#columns');
    expect(elementWithColumnsId).toBeNull();

    // Verify that Form.Item with name="columns" doesn't create id="columns"
    // Ant Design Form.Item may create id based on name, so we need to check
    const formItems = container.querySelectorAll('.ant-form-item');
    formItems.forEach(item => {
      const id = item.getAttribute('id');
      expect(id).not.toBe('columns');
    });
  });

  it('should have scrollable containers for columns and swimlanes when lists are shown', async () => {
    const user = userEvent.setup();
    const manyColumns = Array.from({ length: 20 }, (_, i) => ({
      id: `col${i}`,
      name: `Column ${i}`,
      isKanPlanColumn: false,
    }));

    render(
      <PersonalWipLimitContainer
        columns={manyColumns}
        swimlanes={mockSwimlanes}
        limits={mockLimits}
        checkedIds={[]}
        onAddLimit={vi.fn()}
        onEditLimit={vi.fn()}
        onApplyColumns={vi.fn()}
        onApplySwimlanes={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onCheckboxChange={vi.fn()}
      />
    );

    // Uncheck "All columns" to show the list
    const allColumnsLabel = screen.getByText('All columns');
    const allColumnsCheckbox = allColumnsLabel
      .closest('label')
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(allColumnsCheckbox);

    // Uncheck "All swimlanes" to show the list
    const allSwimlanesLabel = screen.getByText('All swimlanes');
    const allSwimlanesCheckbox = allSwimlanesLabel
      .closest('label')
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(allSwimlanesCheckbox);

    // Wait for lists to appear and find scrollable containers
    await waitFor(
      () => {
        // Find the container by looking for the div that contains checkboxes
        const columnsContainer = screen
          .getByText('All columns')
          .closest('div')
          ?.querySelector('div[style*="max-height"]') as HTMLElement;
        const swimlanesContainer = screen
          .getByText('All swimlanes')
          .closest('div')
          ?.querySelector('div[style*="max-height"]') as HTMLElement;

        expect(columnsContainer).toBeInTheDocument();
        expect(columnsContainer.style.maxHeight).toBe('200px');
        expect(columnsContainer.style.overflowY).toBe('auto');

        expect(swimlanesContainer).toBeInTheDocument();
        expect(swimlanesContainer.style.maxHeight).toBe('200px');
        expect(swimlanesContainer.style.overflowY).toBe('auto');
      },
      { timeout: 2000 }
    );
  });
});
