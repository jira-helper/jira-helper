import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsButtonContainer } from './SettingsButtonContainer';
import { useColumnLimitsPropertyStore } from '../../../property/store';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import * as actions from '../../actions';

// Mock stores
vi.mock('../../../property/store', () => ({
  useColumnLimitsPropertyStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../stores/settingsUIStore', () => ({
  useColumnLimitsSettingsUIStore: {
    getState: vi.fn(),
  },
}));

// Mock actions
vi.mock('../../actions', () => ({
  initFromProperty: vi.fn(),
  saveToProperty: vi.fn(),
}));

// Mock SettingsModalContainer
vi.mock('../SettingsModal', () => ({
  SettingsModalContainer: ({ onClose, onSave }: any) => (
    <div data-testid="mock-modal">
      <button type="button" onClick={onClose}>
        Close
      </button>
      <button type="button" onClick={onSave}>
        Save
      </button>
    </div>
  ),
}));

describe('SettingsButtonContainer', () => {
  const mockGetColumns = vi.fn();
  const mockGetColumnName = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for stores
    (useColumnLimitsPropertyStore.getState as any).mockReturnValue({
      data: {},
    });

    (useColumnLimitsSettingsUIStore.getState as any).mockReturnValue({
      actions: {
        reset: vi.fn(),
      },
    });
  });

  it('should render SettingsButton', () => {
    render(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);
    expect(screen.getByText('Group limits')).toBeInTheDocument();
  });

  it('should open modal and initialize store on click', async () => {
    const mockColumns = [
      {
        dataset: { columnId: 'col1' },
        getAttribute: (name: string) => (name === 'data-column-id' ? 'col1' : null),
      },
    ];
    mockGetColumns.mockReturnValue(mockColumns);
    mockGetColumnName.mockReturnValue('Column 1');

    render(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);

    fireEvent.click(screen.getByText('Group limits'));

    expect(useColumnLimitsSettingsUIStore.getState().actions.reset).toHaveBeenCalled();
    expect(actions.initFromProperty).toHaveBeenCalled();
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('should close modal when handleClose is called', async () => {
    render(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);

    // Open modal
    fireEvent.click(screen.getByText('Group limits'));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('should save and close modal when handleSave is called', async () => {
    mockGetColumns.mockReturnValue([
      {
        dataset: { columnId: 'col1' },
        getAttribute: (name: string) => (name === 'data-column-id' ? 'col1' : null),
      },
    ]);

    render(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);

    // Open modal
    fireEvent.click(screen.getByText('Group limits'));

    // Click save in mock modal
    fireEvent.click(screen.getByText('Save'));

    expect(actions.saveToProperty).toHaveBeenCalledWith(['col1']);
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });
});
