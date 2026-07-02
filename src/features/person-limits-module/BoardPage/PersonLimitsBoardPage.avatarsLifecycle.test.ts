import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { buildAvatarUrlToken } from 'src/infrastructure/di/jiraApiTokens';
import { buildAvatarUrl } from 'src/shared/utils/avatarUrl';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import PersonLimitsBoardPage from './index';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { personLimitsModule } from '../module';
import { boardRuntimeModelToken } from '../tokens';

vi.mock('src/features/board-settings/actions/registerSettings', () => ({
  registerSettings: vi.fn(),
}));

const mockBoardPO = {
  selectors: {
    pool: '#ghx-pool',
  },
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
  getIssueCssSelector: vi.fn(() => '[data-testid="platform-board-kit.ui.card.card"]'),
} as unknown as IBoardPagePageObject;

const mockBoardPropertyService: BoardPropertyServiceI = {
  async getBoardProperty() {
    return undefined;
  },
  updateBoardProperty() {},
  deleteBoardProperty() {},
};

const personLimitsWithOne = {
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

function setupDi(container: Container) {
  container.reset();
  registerLogger(container);
  container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
  container.register({ token: boardPagePageObjectToken, value: mockBoardPO });
  container.register({ token: buildAvatarUrlToken, value: buildAvatarUrl });
  diagnosticModule.ensure(container);
  personLimitsModule.ensure(container);
  container.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
}

function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('PersonLimitsBoardPage — avatars lifecycle', () => {
  let pages: PersonLimitsBoardPage[] = [];

  function createPage(): PersonLimitsBoardPage {
    const page = new PersonLimitsBoardPage(globalContainer);
    pages.push(page);
    return page;
  }

  beforeEach(() => {
    useLocalSettingsStore.getState().updateSettings({ locale: 'auto' });
    delete (mockBoardPO.selectors as { boardHeaderTarget?: string }).boardHeaderTarget;
    vi.mocked(mockBoardPO.getIssueCssSelector!).mockClear();
    document.body.innerHTML =
      '<div id="ghx-view-selector"><div id="subnav-title"></div></div>' + '<div id="ghx-pool"></div>';
    setupDi(globalContainer);
    pages = [];
  });

  afterEach(() => {
    // Tear down every page created in the test so MutationObservers from one
    // test can't leak into the next and resurrect avatars in the new DOM.
    pages.forEach(page => page.clear());
    pages = [];
    document.body.innerHTML = '';
  });

  it('renders avatars container into #subnav-title on apply()', async () => {
    const page = createPage();

    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, personLimitsWithOne]);
    await flush();

    expect(document.querySelector('#subnav-title [data-jh-person-limits="avatars"]')).not.toBeNull();
  });

  it('renders avatars into the Cloud board header and uses the Cloud issue selector', async () => {
    (mockBoardPO.selectors as { boardHeaderTarget?: string }).boardHeaderTarget =
      '[data-testid="software-board.header.controls-bar"]';
    document.body.innerHTML = '<div data-testid="software-board.header.controls-bar"></div>';
    const page = createPage();

    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, personLimitsWithOne]);
    await flush();

    const runtime = globalContainer.inject(boardRuntimeModelToken).model;
    expect(
      document.querySelector('[data-testid="software-board.header.controls-bar"] [data-jh-person-limits="avatars"]')
    ).not.toBeNull();
    expect(mockBoardPO.getIssueCssSelector).toHaveBeenCalled();
    expect(runtime.cssSelectorOfIssues).toBe('[data-testid="platform-board-kit.ui.card.card"]');
  });

  it('re-renders avatars when Jira wipes #subnav-title (regression: 2.30 disappear after board action)', async () => {
    const page = createPage();
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, personLimitsWithOne]);
    await flush();

    // Simulate Jira wiping the subnav (after filter click / card move)
    const subnav = document.getElementById('subnav-title');
    expect(subnav).not.toBeNull();
    subnav!.innerHTML = '';
    expect(document.querySelector('[data-jh-person-limits="avatars"]')).toBeNull();

    // Trigger a mutation inside #ghx-view-selector — same trigger that Jira fires
    // when it re-renders the toolbar after a board interaction.
    document.getElementById('ghx-view-selector')!.appendChild(document.createElement('span'));
    await flush();

    expect(document.querySelector('#subnav-title [data-jh-person-limits="avatars"]')).not.toBeNull();
  });

  it('re-renders avatars when only #ghx-pool mutates (card move)', async () => {
    const page = createPage();
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, personLimitsWithOne]);
    await flush();

    const subnav = document.getElementById('subnav-title');
    subnav!.innerHTML = '';
    expect(document.querySelector('[data-jh-person-limits="avatars"]')).toBeNull();

    document.getElementById('ghx-pool')!.appendChild(document.createElement('div'));
    await flush();

    expect(document.querySelector('#subnav-title [data-jh-person-limits="avatars"]')).not.toBeNull();
  });

  it('clear() unmounts avatars wrapper', async () => {
    const page = createPage();
    page.apply([{ canEdit: false, rapidListConfig: { mappedColumns: [] } }, personLimitsWithOne]);
    await flush();
    expect(document.querySelector('[data-jh-person-limits="avatars"]')).not.toBeNull();

    page.clear();
    await flush();

    expect(document.querySelector('[data-jh-person-limits="avatars"]')).toBeNull();
  });
});
