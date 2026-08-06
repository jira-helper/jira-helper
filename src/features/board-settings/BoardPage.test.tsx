import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Container, globalContainer } from 'dioma';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { routingServiceToken, type IRoutingService } from 'src/infrastructure/routing';
import {
  extensionApiServiceToken,
  type IExtensionApiService,
} from 'src/infrastructure/extension-api/ExtensionApiService';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { BoardSettingsBoardPage } from './BoardPage';

vi.mock('react-dom/client', () => ({
  createRoot: () => ({
    render: vi.fn(),
    unmount: vi.fn(),
  }),
}));

const PRIMARY = '[data-testid="software-board.header.controls-bar"]';

describe('BoardSettingsBoardPage', () => {
  let page: BoardSettingsBoardPage;
  let onUrlChangeCb: ((url: string) => void) | null = null;
  const mockBoardPo = {
    selectors: {
      boardHeaderTarget: PRIMARY,
      sidebar: '.sidebar',
    },
  } as unknown as IBoardPagePageObject;

  beforeEach(() => {
    globalContainer.reset();
    onUrlChangeCb = null;
    document.body.innerHTML = '';

    const mockRouting: IRoutingService = {
      getSearchParam: vi.fn(),
      getBoardIdFromURL: vi.fn(() => '1'),
      getReportNameFromURL: vi.fn(),
      getCurrentRoute: vi.fn(),
      getIssueId: vi.fn(),
      getProjectKeyFromURL: vi.fn(),
      onUrlChange: cb => {
        onUrlChangeCb = cb;
      },
    };

    const extensionApiStub: IExtensionApiService = {
      isFirefox: () => false,
      getUrl: resource => resource,
      onMessage: () => undefined,
      onTabsUpdated: () => undefined,
      onTabsActivated: () => undefined,
      checkTabURLByPattern: async () => ({ result: false, url: '' }),
      sendMessageToTab: async () => undefined,
      removeAllContextMenus: () => undefined,
      addContextMenuListener: () => undefined,
      createContextMenu: () => undefined,
      sendMessage: async () => undefined,
    };

    globalContainer.register({ token: boardPagePageObjectToken, value: mockBoardPo });
    globalContainer.register({ token: routingServiceToken, value: mockRouting });
    globalContainer.register({ token: extensionApiServiceToken, value: extensionApiStub });
    globalContainer.register({ token: localeProviderToken, value: new MockLocaleProvider('en') });

    page = new BoardSettingsBoardPage(globalContainer as Container);
  });

  afterEach(() => {
    page.clear();
    vi.unstubAllGlobals();
  });

  it('mounts into primary controls-bar when present', async () => {
    document.body.innerHTML = `
      <div data-testid="horizontal-nav-header.ui.project-header.header"></div>
      <div data-testid="software-board.header.controls-bar"></div>
    `;

    await page.apply();

    const primary = document.querySelector(PRIMARY);
    expect(primary?.querySelector('[data-jh-component="boardSettingsComponent"]')).toBeTruthy();
    expect(
      document.querySelector(
        '[data-testid="horizontal-nav-header.ui.project-header.header"] [data-jh-component="boardSettingsComponent"]'
      )
    ).toBeNull();
  });

  it('mounts as last child of project header when primary is missing', async () => {
    document.body.innerHTML = `
      <div data-testid="horizontal-nav-header.ui.project-header.header">
        <span id="existing">nav</span>
      </div>
    `;
    vi.stubGlobal('location', new URL('https://x.atlassian.net/jira/software/projects/KAN/boards/1'));

    await page.apply();

    const header = document.querySelector('[data-testid="horizontal-nav-header.ui.project-header.header"]');
    const button = header?.querySelector('[data-jh-component="boardSettingsComponent"]') as HTMLElement;
    expect(button).toBeTruthy();
    expect(header?.lastElementChild).toBe(button);
    expect(button.style.display).toBe('inline-block');
  });

  it('hides fallback mount off board urls and shows it again on board url change', async () => {
    document.body.innerHTML = '<div data-testid="horizontal-nav-header.ui.project-header.header"></div>';
    vi.stubGlobal('location', new URL('https://x.atlassian.net/jira/software/projects/KAN/issues'));

    await page.apply();

    const button = document.querySelector('[data-jh-component="boardSettingsComponent"]') as HTMLElement;
    expect(button.style.display).toBe('none');

    onUrlChangeCb?.('https://x.atlassian.net/jira/software/projects/KAN/boards/1');
    expect(button.style.display).toBe('inline-block');

    onUrlChangeCb?.('https://x.atlassian.net/jira/software/projects/KAN/issues');
    expect(button.style.display).toBe('none');
  });
});
