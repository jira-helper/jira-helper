import { types } from './background/actions';
import { waitForElement } from './shared/utils';
import { extensionApiService } from './shared/ExtensionApiService';

export const Routes = {
  BOARD: 'BOARD',
  BOARD_BACKLOG: 'BOARD_BACKLOG',
  SETTINGS: 'SETTINGS',
  SEARCH: 'SEARCH',
  REPORTS: 'REPORTS',
  ISSUE: 'ISSUE',
  ALL: 'ALL',
};

type Route = (typeof Routes)[keyof typeof Routes];

export const getSearchParam = (param: string): string | null => {
  return new URLSearchParams(window.location.search).get(param);
};

/*
  sheme new 2022: https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/41/reports/control-chart?days=0
*/
export const getReportNameFromURL = (): string | null => {
  const matchRapidView = window.location.pathname.match(/reports\/([^/?]*)/im);
  return matchRapidView ? matchRapidView[1] : null;
};

/*
  sheme old https://companyname.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12
  sheme new https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/12
  sheme new 2022: https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/41/reports/control-chart?days=0
*/
export const getBoardIdFromURL = (): string | null => {
  if (window.location.href.includes('rapidView')) {
    return getSearchParam('rapidView');
  }

  const matchRapidView = window.location.pathname.match(/boards\/(\d+)/im);
  return matchRapidView ? matchRapidView[1] : null;
};

/*
cloud update 2021-09-30
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=filter
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=columns
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=swimlanes
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=swimlanes
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=cardColors
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=cardLayout
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=cardLayout
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=detailView
https://mycompany.atlassian.net/jira/software/c/projects/MP/boards/138?config=roadmapConfig
*/
export const getCurrentRoute = (): Route | null => {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);

  if (pathname.includes('RapidView.jspa')) return Routes.SETTINGS;

  if (pathname.includes('RapidBoard.jspa')) {
    if (params.get('config')) return Routes.SETTINGS;
    if (params.get('view') === 'reporting') return Routes.REPORTS;
    if (params.get('view') === 'planning.nodetail' || params.get('view') === 'planning') return Routes.BOARD_BACKLOG;

    return Routes.BOARD;
  }

  // cloud update 2021-09-30
  if (/boards\/(\d+)/im.test(pathname)) {
    if (params.get('config')) return Routes.SETTINGS;
    if (params.get('view') === 'reporting') return Routes.REPORTS;
    // https://{server}/jira/software/c/projects/{key}/boards/{id}/reports/control-chart?days=0
    if (/reports/im.test(pathname)) return Routes.REPORTS;

    return Routes.BOARD;
  }

  if (pathname.startsWith('/browse') || pathname.startsWith('/jira/browse')) {
    return params.get('jql') ? Routes.SEARCH : Routes.ISSUE;
  }

  // https://server.atlassian.net/jira/software/c/projects/{KEY}/issues/?jql=...
  if (pathname.endsWith('/issues/')) return Routes.SEARCH;

  return null;
};

export const getSettingsTab = (): Promise<string | null> => {
  const search = new URLSearchParams(window.location.search);

  const tabFromUrl = search.get('tab') || search.get('config');

  return tabFromUrl
    ? Promise.resolve(tabFromUrl)
    : waitForElement('.aui-nav-selected').promise.then(
        selectedNav =>
          // @ts-expect-error dataset по типам не существует
          selectedNav?.dataset.tabitem || null
      );
};

export const getIssueId = (): string | null => {
  if (window.location.pathname.startsWith('/browse') || window.location.pathname.startsWith('/jira/browse')) {
    return window.location.pathname.split('/browse/')[1];
  }

  const selectedIssue = getSearchParam('selectedIssue');
  if (selectedIssue && (getSearchParam('view') || getSearchParam('modal'))) {
    return selectedIssue;
  }

  return null;
};

export const onUrlChange = (cb: (url: string) => void): void => {
  extensionApiService.onMessage((request: { type: string; url: string }, sender, sendResponse) => {
    if (!sender.tab && request.type === types.TAB_URL_CHANGE) {
      cb(request.url);
      sendResponse({ message: 'change event received' });
    }
  });
};
