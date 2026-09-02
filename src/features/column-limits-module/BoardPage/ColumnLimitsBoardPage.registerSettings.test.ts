import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactElement } from 'react';
import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import ColumnLimitsBoardPage from './index';
import { columnLimitsModule } from '../module';
import { propertyModelToken } from '../tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { COLUMN_LIMITS_TEXTS } from '../SettingsPage/texts';

vi.mock('src/features/board-settings/actions/registerSettings', () => ({
  registerSettings: vi.fn(),
}));

const mockBoardPO = {
  getOrderedColumnIds: vi.fn(() => ['c1']),
  getOrderedColumns: vi.fn(() => [{ id: 'c1', name: 'Col1' }]),
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
  updateBoardProperty() {},
  deleteBoardProperty() {},
};

function setupDi(container: Container) {
  container.reset();
  registerLogger(container);
  container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
  container.register({ token: boardPagePageObjectToken, value: mockBoardPO });
  diagnosticModule.ensure(container);
  columnLimitsModule.ensure(container);
  container.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
}

describe('ColumnLimitsBoardPage — registerSettings', () => {
  beforeEach(() => {
    vi.mocked(registerSettings).mockClear();
    useLocalSettingsStore.getState().updateSettings({ locale: 'auto' });
    document.body.innerHTML = '<div id="ghx-pool"></div><div id="ghx-pool-wrapper"></div>';
    setupDi(globalContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function getRegisteredSwimlanes(): Array<{ id: string; name: string }> {
    const callArgs = vi.mocked(registerSettings).mock.calls[0][0];
    const tabComponent = callArgs.component as () => ReactElement<{ swimlanes: Array<{ id: string; name: string }> }>;
    return tabComponent().props.swimlanes;
  }

  it('registers board settings tab when canEdit and WIP property is non-empty', () => {
    const page = new ColumnLimitsBoardPage(globalContainer);
    const editData = {
      canEdit: true,
      rapidListConfig: { mappedColumns: [] as Array<{ id: string; isKanPlanColumn: boolean; max?: number }> },
      swimlanesConfig: { swimlanes: [{ id: 's1', name: 'Lane1' }] },
    };
    const boardGroups = { G1: { columns: ['c1'], max: 5 } };

    page.apply([editData, boardGroups]);

    expect(registerSettings).toHaveBeenCalledTimes(1);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: COLUMN_LIMITS_TEXTS.tabTitle.en,
        component: expect.any(Function),
      })
    );
    expect(getRegisteredSwimlanes()).toEqual([{ id: 's1', name: 'Lane1' }]);
  });

  it('falls back to cached swimlanes when editData swimlanes list is empty', () => {
    globalContainer.register({
      token: boardPagePageObjectToken,
      value: {
        ...mockBoardPO,
        getCachedSwimlanes: vi.fn(() => [
          { id: '6', name: 'Expedite' },
          { id: '2', name: 'Everything Else' },
        ]),
      } as unknown as IBoardPagePageObject,
    });

    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([
      {
        canEdit: true,
        rapidListConfig: { mappedColumns: [] },
        swimlanesConfig: { swimlaneStrategy: 'custom', swimlanes: [] },
      },
      { G1: { columns: ['c1'], max: 5 } },
    ]);

    expect(getRegisteredSwimlanes()).toEqual([
      { id: '6', name: 'Expedite' },
      { id: '2', name: 'Everything Else' },
    ]);
  });

  it('uses Russian tab title when local settings locale is ru', () => {
    useLocalSettingsStore.getState().updateSettings({ locale: 'ru' });
    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, { G1: { columns: ['c1'], max: 5 } }]);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: COLUMN_LIMITS_TEXTS.tabTitle.ru,
      })
    );
  });

  it('uses Russian tab title when Jira locale is ru', () => {
    globalContainer.reset();
    setupDi(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('ru'),
    });

    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, { G1: { columns: ['c1'], max: 5 } }]);

    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: COLUMN_LIMITS_TEXTS.tabTitle.ru,
      })
    );
  });

  it('registers when canEdit is false (viewers can open the tab)', () => {
    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, { G1: { columns: ['c1'], max: 5 } }]);
    expect(registerSettings).toHaveBeenCalledTimes(1);
  });

  it('registers when canEdit and WIP property is empty (S6 empty state)', () => {
    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, {}]);
    expect(registerSettings).toHaveBeenCalledTimes(1);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: COLUMN_LIMITS_TEXTS.tabTitle.en,
        component: expect.any(Function),
      })
    );
  });

  it('registers when canEdit is false and WIP property is empty', () => {
    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, {}]);
    expect(registerSettings).toHaveBeenCalledTimes(1);
  });

  it('strips unknown column ids in memory and does not persist on apply', () => {
    const { model: propertyModel } = globalContainer.inject(propertyModelToken);
    const persistSpy = vi.spyOn(propertyModel, 'persist').mockResolvedValue({ ok: true, val: undefined } as never);

    const page = new ColumnLimitsBoardPage(globalContainer);
    const editData = {
      canEdit: true,
      rapidListConfig: {
        mappedColumns: [
          { id: '115', isKanPlanColumn: false },
          { id: '116', isKanPlanColumn: false },
          { id: '118', isKanPlanColumn: true },
        ],
      },
    };
    const boardGroups = {
      G1: { columns: ['115', '999'], max: 5 },
      G2: { columns: ['888'], max: 3 },
      G3: { columns: ['116'], max: 2 },
    };

    page.apply([editData, boardGroups]);

    expect(propertyModel.data).toEqual({
      G1: { columns: ['115'], max: 5 },
      G3: { columns: ['116'], max: 2 },
    });
    expect(persistSpy).not.toHaveBeenCalled();
    expect(registerSettings).toHaveBeenCalledTimes(1);
  });

  it('keeps stored string column ids when editmodel returns numeric ids and does not persist', () => {
    const { model: propertyModel } = globalContainer.inject(propertyModelToken);
    const persistSpy = vi.spyOn(propertyModel, 'persist').mockResolvedValue({ ok: true, val: undefined } as never);

    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([
      {
        canEdit: true,
        rapidListConfig: {
          mappedColumns: [
            { id: 115, isKanPlanColumn: false },
            { id: 116, isKanPlanColumn: false },
          ],
        },
      },
      { G1: { columns: ['115', '116'], max: 5 } },
    ]);

    expect(propertyModel.data).toEqual({ G1: { columns: ['115', '116'], max: 5 } });
    expect(persistSpy).not.toHaveBeenCalled();
  });
});
