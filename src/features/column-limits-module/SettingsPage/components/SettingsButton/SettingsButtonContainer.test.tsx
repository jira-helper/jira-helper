import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { columnLimitsModule } from '../../../module';
import { settingsUIModelToken } from '../../../tokens';
import type { SettingsUIModel } from '../../models/SettingsUIModel';
import { SettingsButtonContainer } from './SettingsButtonContainer';

// Mock SettingsModalContainer
vi.mock('../SettingsModal', () => ({
  SettingsModalContainer: ({ onClose, onSave }: { onClose: () => void; onSave: () => Promise<void> }) => (
    <div data-testid="mock-modal">
      <button type="button" onClick={onClose}>
        Close
      </button>
      <button type="button" onClick={() => void onSave()}>
        Save
      </button>
    </div>
  ),
}));

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

const renderWithDi = (ui: React.ReactElement) => {
  return render(<WithDi container={globalContainer}>{ui}</WithDi>);
};

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

describe('SettingsButtonContainer', () => {
  const mockGetColumns = vi.fn();
  const mockGetColumnName = vi.fn();
  const buttonLabel = 'Column group WIP limits';

  beforeEach(() => {
    vi.clearAllMocks();
    globalContainer.reset();
    registerColumnLimitsTestDi();
  });

  it('should render SettingsButton', () => {
    renderWithDi(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);
    expect(screen.getByText(buttonLabel)).toBeInTheDocument();
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

    const settingsModel = globalContainer.inject(settingsUIModelToken).model as SettingsUIModel;
    const resetSpy = vi.spyOn(settingsModel, 'reset');
    const initSpy = vi.spyOn(settingsModel, 'initFromProperty');

    renderWithDi(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);

    fireEvent.click(screen.getByText(buttonLabel));

    expect(resetSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('should close modal when handleClose is called', async () => {
    renderWithDi(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);

    fireEvent.click(screen.getByText(buttonLabel));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

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

    const settingsModel = globalContainer.inject(settingsUIModelToken).model as SettingsUIModel;
    const saveSpy = vi.spyOn(settingsModel, 'save').mockResolvedValue(undefined);

    renderWithDi(<SettingsButtonContainer getColumns={mockGetColumns} getColumnName={mockGetColumnName} />);

    fireEvent.click(screen.getByText(buttonLabel));

    fireEvent.click(screen.getByText('Save'));

    expect(saveSpy).toHaveBeenCalledWith(['col1']);
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });
});
