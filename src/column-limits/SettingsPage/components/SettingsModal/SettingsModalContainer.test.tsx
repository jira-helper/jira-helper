import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsModalContainer } from './SettingsModalContainer';

// Mock store
vi.mock('../../stores/settingsUIStore', () => {
  const mockActions = {
    setGroupLimit: vi.fn(),
    setIssueTypeState: vi.fn(),
    reset: vi.fn(),
  };

  const useStore = (selector: any) =>
    selector({
      data: {
        withoutGroupColumns: [],
        groups: [],
        issueTypeSelectorStates: {},
      },
      actions: mockActions,
    });

  (useStore as any).getState = () => ({
    data: {
      withoutGroupColumns: [],
      groups: [],
      issueTypeSelectorStates: {},
    },
    actions: mockActions,
  });

  return {
    useColumnLimitsSettingsUIStore: useStore,
  };
});

// Mock actions
vi.mock('../../actions', () => ({
  moveColumn: vi.fn(),
}));

// Mock SettingsModal to avoid rendering its complex logic
vi.mock('./SettingsModal', () => ({
  SettingsModal: ({ children, title, onSave, onClose, isSaving }: any) => (
    <div data-testid="mock-modal">
      <h1>{title}</h1>
      <button type="button" onClick={onClose}>
        Close
      </button>
      <button type="button" onClick={onSave}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      {children}
    </div>
  ),
}));

// Mock ColumnLimitsForm
vi.mock('../../ColumnLimitsForm', () => ({
  ColumnLimitsForm: () => <div data-testid="mock-form">Form</div>,
}));

describe('SettingsModalContainer', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SettingsModal and ColumnLimitsForm', () => {
    render(<SettingsModalContainer onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
    expect(screen.getByText('Limits for groups')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked and handle isSaving state', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

    render(<SettingsModalContainer onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    render(<SettingsModalContainer onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
