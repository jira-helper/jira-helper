import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { columnLimitsModule } from '../module';
import { settingsUIModelToken, boardRuntimeModelToken, propertyModelToken } from '../tokens';
import type { SettingsUIModel } from '../SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from '../BoardPage/models/BoardRuntimeModel';
import { ColumnLimitsSettingsTab } from './ColumnLimitsSettingsTab';

vi.mock('../SettingsPage/ColumnLimitsForm', () => ({
  ColumnLimitsForm: ({ formId, createGroupDropzoneId }: { formId: string; createGroupDropzoneId: string }) => (
    <div data-testid="mock-form" data-form-id={formId} data-dropzone-id={createGroupDropzoneId}>
      form
    </div>
  ),
}));

const getOrderedColumns = vi.fn(() => [
  { id: 'c1', name: 'One' },
  { id: 'c2', name: 'Two' },
]);

const getOrderedColumnIds = vi.fn(() => ['c1', 'c2']);

const mockBoardPO = {
  getOrderedColumns,
  getOrderedColumnIds,
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

const mockBoardPropertyService: BoardPropertyServiceI = {
  async getBoardProperty() {
    return undefined;
  },
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

function setupDi() {
  globalContainer.reset();
  registerLogger(globalContainer);
  globalContainer.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
  globalContainer.register({ token: boardPagePageObjectToken, value: mockBoardPO });
  columnLimitsModule.ensure(globalContainer);
  globalContainer.register({ token: localeProviderToken, value: new MockLocaleProvider('en') });
}

describe('ColumnLimitsSettingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDi();
    globalContainer.inject(propertyModelToken).model.setData({
      grp: { columns: ['c1'], max: 3, customHexColor: '#000' },
    });
  });

  it('uses tab-specific form and dropzone ids', async () => {
    render(
      <WithDi container={globalContainer}>
        <ColumnLimitsSettingsTab swimlanes={[]} />
      </WithDi>
    );

    await waitFor(() => {
      expect(getOrderedColumns).toHaveBeenCalled();
    });

    const form = screen.getByTestId('mock-form');
    expect(form).toHaveAttribute('data-form-id', 'jh-wip-limits-tab-form');
    expect(form).toHaveAttribute('data-dropzone-id', 'jh-tab-column-dropzone');
  });

  it('on Save persists via SettingsUIModel.save and reapplies BoardRuntimeModel', async () => {
    const user = userEvent.setup();
    const { model: uiModel } = globalContainer.inject(settingsUIModelToken);
    const saveSpy = vi.spyOn(uiModel as SettingsUIModel, 'save').mockResolvedValue(undefined);
    const { model: runtimeModel } = globalContainer.inject(boardRuntimeModelToken);
    const applySpy = vi.spyOn(runtimeModel as BoardRuntimeModel, 'apply');

    render(
      <WithDi container={globalContainer}>
        <ColumnLimitsSettingsTab swimlanes={[]} />
      </WithDi>
    );

    await waitFor(() => expect(getOrderedColumns).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Save configuration' }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(['c1', 'c2']);
      expect(applySpy).toHaveBeenCalled();
    });
  });

  it('S6: empty property puts all board columns in withoutGroup', async () => {
    globalContainer.inject(propertyModelToken).model.setData({});
    const { model: uiModel } = globalContainer.inject(settingsUIModelToken);
    const initSpy = vi.spyOn(uiModel as SettingsUIModel, 'initFromProperty');

    render(
      <WithDi container={globalContainer}>
        <ColumnLimitsSettingsTab swimlanes={[]} />
      </WithDi>
    );

    await waitFor(() => expect(initSpy).toHaveBeenCalled());
    const initData = initSpy.mock.calls[0][0];
    expect(initData.withoutGroupColumns).toEqual([
      { id: 'c1', name: 'One' },
      { id: 'c2', name: 'Two' },
    ]);
    expect(initData.groups).toEqual([]);
  });

  it('on Cancel resets UI and reloads init from board columns and property', async () => {
    const user = userEvent.setup();
    const { model: uiModel } = globalContainer.inject(settingsUIModelToken);
    const resetSpy = vi.spyOn(uiModel as SettingsUIModel, 'reset');
    const initSpy = vi.spyOn(uiModel as SettingsUIModel, 'initFromProperty');

    render(
      <WithDi container={globalContainer}>
        <ColumnLimitsSettingsTab swimlanes={[]} />
      </WithDi>
    );

    await waitFor(() => expect(initSpy).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'Discard changes' }));

    expect(resetSpy).toHaveBeenCalled();
    expect(getOrderedColumns).toHaveBeenCalledTimes(2);
    expect(initSpy).toHaveBeenCalledTimes(2);
  });
});
