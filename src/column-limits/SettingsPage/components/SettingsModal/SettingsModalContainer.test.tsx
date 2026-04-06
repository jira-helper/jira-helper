import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { loggerToken, Logger } from 'src/shared/Logger';
import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { columnLimitsModule } from '../../../module';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { SettingsModalContainer } from './SettingsModalContainer';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

const mockBoardPagePageObject: IBoardPagePageObject = {
  getOrderedColumnIds: vi.fn(() => []),
  getColumnHeaderElement: vi.fn(() => null),
  getSwimlaneIds: vi.fn(() => []),
  getIssueCountInColumn: vi.fn(() => 0),
  styleColumnHeader: vi.fn(),
  resetColumnHeaderStyles: vi.fn(),
  insertColumnHeaderHtml: vi.fn(),
  removeColumnHeaderElements: vi.fn(),
  highlightColumnCells: vi.fn(),
  resetColumnCellStyles: vi.fn(),
} as unknown as IBoardPagePageObject;

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

const registerColumnLimitsTestDi = () => {
  globalContainer.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
  globalContainer.register({ token: loggerToken, value: new Logger() });
  globalContainer.register({ token: boardPagePageObjectToken, value: mockBoardPagePageObject });
  columnLimitsModule.ensure(globalContainer);
  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
};

describe('SettingsModalContainer', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalContainer.reset();
    registerColumnLimitsTestDi();
  });

  it('should render SettingsModal and ColumnLimitsForm', () => {
    render(
      <WithDi container={globalContainer}>
        <SettingsModalContainer onClose={mockOnClose} onSave={mockOnSave} />
      </WithDi>
    );

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
    expect(screen.getByText('Limits for groups')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked and handle isSaving state', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

    render(
      <WithDi container={globalContainer}>
        <SettingsModalContainer onClose={mockOnClose} onSave={mockOnSave} />
      </WithDi>
    );

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <WithDi container={globalContainer}>
        <SettingsModalContainer onClose={mockOnClose} onSave={mockOnSave} />
      </WithDi>
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
