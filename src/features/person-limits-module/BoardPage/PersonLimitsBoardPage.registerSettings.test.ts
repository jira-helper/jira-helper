import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { buildAvatarUrlToken } from 'src/infrastructure/di/jiraApiTokens';
import { buildAvatarUrl } from 'src/shared/utils/avatarUrl';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import PersonLimitsBoardPage from './index';
import { personLimitsModule } from '../module';
import { boardRuntimeModelToken } from '../tokens';
import { PERSON_LIMITS_TEXTS } from '../SettingsPage/texts';
import type { ReactElement } from 'react';

vi.mock('src/features/board-settings/actions/registerSettings', () => ({
  registerSettings: vi.fn(),
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
  updateBoardProperty() {},
  deleteBoardProperty() {},
};

const minimalPersonLimits = {
  limits: [
    {
      id: 1,
      person: { name: 'u1', self: 'http://jira/u1' },
      limit: 3,
      columns: [{ id: 'c1', name: 'Col1' }],
      swimlanes: [{ id: 's1', name: 'S1' }],
    },
  ],
};

function registerPersonLimitsBoardPageTestDeps(container: Container) {
  registerLogger(container);
  container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
  container.register({ token: boardPagePageObjectToken, value: mockBoardPO });
  container.register({ token: buildAvatarUrlToken, value: buildAvatarUrl });
  personLimitsModule.ensure(container);
  container.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
}

function setupDi(container: Container) {
  container.reset();
  registerPersonLimitsBoardPageTestDeps(container);
}

describe('PersonLimitsBoardPage — registerSettings', () => {
  beforeEach(() => {
    vi.mocked(registerSettings).mockClear();
    useLocalSettingsStore.getState().updateSettings({ locale: 'auto' });
    document.body.innerHTML = '<div id="subnav-title"></div><div id="ghx-pool"></div>';
    setupDi(globalContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('registers board settings tab when canEdit and person limits property is non-empty', () => {
    const page = new PersonLimitsBoardPage(globalContainer);
    const editData = {
      canEdit: true,
      rapidListConfig: {
        mappedColumns: [
          { id: 'c1', name: 'Col1', isKanPlanColumn: false },
          { id: 'kp', name: 'Plan', isKanPlanColumn: true },
        ],
      },
      swimlanesConfig: { swimlanes: [{ id: 's1', name: 'Lane1' }, { name: 'Lane2' }] },
    };

    page.apply([editData, minimalPersonLimits]);

    expect(registerSettings).toHaveBeenCalledTimes(1);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: PERSON_LIMITS_TEXTS.tabTitle.en,
        component: expect.any(Function),
      })
    );
  });

  it('uses Russian tab title when local settings locale is ru', () => {
    useLocalSettingsStore.getState().updateSettings({ locale: 'ru' });
    const page = new PersonLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, minimalPersonLimits]);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: PERSON_LIMITS_TEXTS.tabTitle.ru,
      })
    );
  });

  it('uses Russian tab title when Jira locale is ru', () => {
    globalContainer.reset();
    registerPersonLimitsBoardPageTestDeps(globalContainer);
    globalContainer.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('ru'),
    });

    const page = new PersonLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, minimalPersonLimits]);

    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: PERSON_LIMITS_TEXTS.tabTitle.ru,
      })
    );
  });

  it('still registers when canEdit is false (read-only viewers can inspect/tweak locally)', () => {
    const page = new PersonLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, minimalPersonLimits]);
    expect(registerSettings).toHaveBeenCalledTimes(1);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: PERSON_LIMITS_TEXTS.tabTitle.en,
        component: expect.any(Function),
      })
    );
  });

  it('registers when canEdit and person limits property is empty', () => {
    const page = new PersonLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, { limits: [] }]);
    expect(registerSettings).toHaveBeenCalledTimes(1);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: PERSON_LIMITS_TEXTS.tabTitle.en,
        component: expect.any(Function),
      })
    );
  });

  it('registers when canEdit and person limits property is null', () => {
    const page = new PersonLimitsBoardPage(globalContainer);
    page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, null]);
    expect(registerSettings).toHaveBeenCalledTimes(1);
    expect(registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: PERSON_LIMITS_TEXTS.tabTitle.en,
        component: expect.any(Function),
      })
    );
  });

  describe('swimlane strategy handling', () => {
    // Jira's editmodel returns saved query swimlanes regardless of the active strategy.
    // We must only expose them when strategy === 'custom'; otherwise the user would be
    // able to filter by inert entries that won't match anything on the rendered board.

    function getRegisteredSwimlanes(): unknown[] {
      const callArgs = vi.mocked(registerSettings).mock.calls[0][0];
      const tabComponent = callArgs.component as () => ReactElement<{ swimlanes: unknown[] }>;
      return tabComponent().props.swimlanes;
    }

    it('passes board swimlanes to the registered tab when strategy is "custom"', () => {
      const page = new PersonLimitsBoardPage(globalContainer);
      page.apply([
        {
          canEdit: true,
          rapidListConfig: { mappedColumns: [] },
          swimlanesConfig: {
            swimlaneStrategy: 'custom',
            swimlanes: [
              { id: 's1', name: 'Lane1' },
              { id: 's2', name: 'Lane2' },
            ],
          },
        },
        minimalPersonLimits,
      ]);

      expect(getRegisteredSwimlanes()).toHaveLength(2);
    });

    it('passes empty swimlanes to the registered tab when strategy is not "custom"', () => {
      const page = new PersonLimitsBoardPage(globalContainer);
      page.apply([
        {
          canEdit: true,
          rapidListConfig: { mappedColumns: [] },
          swimlanesConfig: {
            // Strategy is e.g. "none" / "parentChild" / "assignee" / "epic" / "project".
            // Jira still returns historical query swimlanes — they must be hidden from the user.
            swimlaneStrategy: 'parentChild',
            swimlanes: [
              { id: 's1', name: 'Stale1' },
              { id: 's2', name: 'Stale2' },
            ],
          },
        },
        minimalPersonLimits,
      ]);

      expect(getRegisteredSwimlanes()).toHaveLength(0);
    });

    it('passes empty swimlanes when swimlanesConfig is missing entirely', () => {
      const page = new PersonLimitsBoardPage(globalContainer);
      page.apply([{ canEdit: true, rapidListConfig: { mappedColumns: [] } }, minimalPersonLimits]);

      expect(getRegisteredSwimlanes()).toHaveLength(0);
    });

    it('enables runtime swimlanes when strategy is "custom"', () => {
      const setSwimlanesActive = vi.spyOn(globalContainer.inject(boardRuntimeModelToken).model, 'setSwimlanesActive');

      const page = new PersonLimitsBoardPage(globalContainer);
      page.apply([
        {
          canEdit: true,
          rapidListConfig: { mappedColumns: [] },
          swimlanesConfig: { swimlaneStrategy: 'custom', swimlanes: [] },
        },
        minimalPersonLimits,
      ]);

      expect(setSwimlanesActive).toHaveBeenCalledWith(true);
    });

    it('disables runtime swimlanes when strategy is not "custom"', () => {
      const setSwimlanesActive = vi.spyOn(globalContainer.inject(boardRuntimeModelToken).model, 'setSwimlanesActive');

      const page = new PersonLimitsBoardPage(globalContainer);
      page.apply([
        {
          canEdit: true,
          rapidListConfig: { mappedColumns: [] },
          swimlanesConfig: { swimlaneStrategy: 'epic', swimlanes: [{ id: 's1', name: 'Stale' }] },
        },
        minimalPersonLimits,
      ]);

      expect(setSwimlanesActive).toHaveBeenCalledWith(false);
    });
  });
});
