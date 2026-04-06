import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/page-objects/BoardPage';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import ColumnLimitsBoardPage from './index';
import { columnLimitsModule } from '../module';
import { COLUMN_LIMITS_TEXTS } from '../SettingsPage/texts';

vi.mock('src/board-settings/actions/registerSettings', () => ({
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

  it('does not register when canEdit is false', () => {
    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, { G1: { columns: ['c1'], max: 5 } }]);
    expect(registerSettings).not.toHaveBeenCalled();
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

  it('does not register when canEdit is false and WIP property is empty', () => {
    const page = new ColumnLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, {}]);
    expect(registerSettings).not.toHaveBeenCalled();
  });
});
