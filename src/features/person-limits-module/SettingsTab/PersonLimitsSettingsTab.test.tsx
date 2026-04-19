import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Ok } from 'ts-results';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { searchUsersToken } from 'src/infrastructure/di/jiraApiTokens';
import { personLimitsModule } from '../module';
import { settingsUIModelToken, boardRuntimeModelToken, propertyModelToken } from '../tokens';
import type { SettingsUIModel } from '../SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from '../BoardPage/models/BoardRuntimeModel';
import { PersonLimitsSettingsTab } from './PersonLimitsSettingsTab';

vi.mock('../SettingsPage/components/PersonalWipLimitContainer', () => ({
  PersonalWipLimitContainer: () => <div data-testid="mock-personal-wip">form</div>,
}));

const mockBoardPO = {
  hasCustomSwimlanes: vi.fn(() => false),
  getColumnElements: vi.fn(() => []),
  getColumnsInSwimlane: vi.fn(() => []),
  getIssueElements: vi.fn(() => []),
  getIssueElementsInColumn: vi.fn(() => []),
  getAssigneeFromIssue: vi.fn(() => null),
  getIssueTypeFromIssue: vi.fn(() => null),
  getColumnIdFromColumn: vi.fn(() => null),
  getParentGroups: vi.fn(() => []),
  getSwimlanes: vi.fn(() => []),
  countIssueVisibility: vi.fn(() => ({ total: 0, hidden: 0 })),
  setIssueBackgroundColor: vi.fn(),
  resetIssueBackgroundColor: vi.fn(),
  setIssueVisibility: vi.fn(),
  setSwimlaneVisibility: vi.fn(),
  setParentGroupVisibility: vi.fn(),
  getColumnIdOfIssue: vi.fn(() => null),
  getSwimlaneIdOfIssue: vi.fn(() => null),
} as unknown as IBoardPagePageObject;

const mockBoardPropertyService: BoardPropertyServiceI = {
  async getBoardProperty() {
    return undefined;
  },
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

const columns = [{ id: 'c1', name: 'Col1' }];
const swimlanes: { id: string; name: string }[] = [];

function setupDi() {
  globalContainer.reset();
  registerLogger(globalContainer);
  globalContainer.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
  globalContainer.register({ token: boardPagePageObjectToken, value: mockBoardPO });
  globalContainer.register({ token: searchUsersToken, value: vi.fn(async () => []) });
  personLimitsModule.ensure(globalContainer);
  globalContainer.register({ token: localeProviderToken, value: new MockLocaleProvider('en') });
}

describe('PersonLimitsSettingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDi();
    globalContainer.inject(propertyModelToken).model.setData({
      limits: [
        {
          id: 1,
          person: { name: 'u1', self: 'http://jira/u1' },
          limit: 3,
          columns: [{ id: 'c1', name: 'Col1' }],
          swimlanes: [],
        },
      ],
    });
  });

  it('calls initFromProperty on mount', async () => {
    const { model: uiModel } = globalContainer.inject(settingsUIModelToken);
    const initSpy = vi.spyOn(uiModel as SettingsUIModel, 'initFromProperty');

    render(
      <WithDi container={globalContainer}>
        <PersonLimitsSettingsTab columns={columns} swimlanes={swimlanes} />
      </WithDi>
    );

    await waitFor(() => expect(initSpy).toHaveBeenCalled());
  });

  it('on Save calls settingsUi.save then runtimeModel.apply and showOnlyChosen', async () => {
    const user = userEvent.setup();
    const { model: uiModel } = globalContainer.inject(settingsUIModelToken);
    const saveSpy = vi.spyOn(uiModel as SettingsUIModel, 'save').mockResolvedValue(Ok(undefined));
    const { model: runtimeModel } = globalContainer.inject(boardRuntimeModelToken);
    const applySpy = vi.spyOn(runtimeModel as BoardRuntimeModel, 'apply');
    const showOnlyChosenSpy = vi.spyOn(runtimeModel as BoardRuntimeModel, 'showOnlyChosen');

    render(
      <WithDi container={globalContainer}>
        <PersonLimitsSettingsTab columns={columns} swimlanes={swimlanes} />
      </WithDi>
    );

    await user.click(screen.getByRole('button', { name: 'Save configuration' }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
      expect(applySpy).toHaveBeenCalled();
      expect(showOnlyChosenSpy).toHaveBeenCalled();
    });

    const saveOrder = saveSpy.mock.invocationCallOrder[0];
    const applyOrder = applySpy.mock.invocationCallOrder[0];
    const showOrder = showOnlyChosenSpy.mock.invocationCallOrder[0];
    expect(saveOrder).toBeLessThan(applyOrder);
    expect(applyOrder).toBeLessThan(showOrder);
  });

  it('on Cancel calls initFromProperty again to reset from property (after local edits)', async () => {
    const user = userEvent.setup();
    const { model: uiModel } = globalContainer.inject(settingsUIModelToken);
    const initSpy = vi.spyOn(uiModel as SettingsUIModel, 'initFromProperty');

    render(
      <WithDi container={globalContainer}>
        <PersonLimitsSettingsTab columns={columns} swimlanes={swimlanes} />
      </WithDi>
    );

    await waitFor(() => expect(initSpy).toHaveBeenCalledTimes(1));

    uiModel.limits.push({
      id: 99,
      person: { name: 'draft', self: 'http://jira/draft' },
      limit: 1,
      columns: [],
      swimlanes: [],
      showAllPersonIssues: true,
    });
    expect(uiModel.limits).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Discard changes' }));

    await waitFor(() => expect(initSpy).toHaveBeenCalledTimes(2));
    expect(uiModel.limits).toHaveLength(1);
    expect(uiModel.limits[0]?.person.name).toBe('u1');
  });
});
