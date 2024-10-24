import { types } from './background/actions';
import { waitForElement } from './shared/utils';
import { extensionApiService } from './shared/ExtensionApiService';

export const Routes = {
  BOARD: 'BOARD',
  SETTINGS: 'SETTINGS',
  SEARCH: 'SEARCH',
  REPORTS: 'REPORTS',
  ISSUE: 'ISSUE',
  ALL: 'ALL',
};

export const getSearchParam = param => {
  return new URLSearchParams(window.location.search).get(param);
};

/*
  sheme new 2022: https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/41/reports/control-chart?days=0
*/
export const getReportNameFromURL = () => {
  // eslint-disable-next-line no-useless-escape
  const matchRapidView = window.location.pathname.match(/reports\/([^\/\?]*)/im);
  if (matchRapidView != null) {
    return matchRapidView[1];
  }
  return null;
};

/*
  sheme old https://companyname.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12
  sheme new https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/12
  sheme new 2022: https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/41/reports/control-chart?days=0
*/
export const getBoardIdFromURL = () => {
  if (window.location.href.indexOf('rapidView') > 0) {
    return getSearchParam('rapidView');
  }

  const matchRapidView = window.location.pathname.match(/boards\/(\d+)/im);
  if (matchRapidView != null) {
    return matchRapidView[1];
  }

  return null;
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

export const getCurrentRoute = () => {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);

  if (pathname.includes('RapidView.jspa')) return Routes.SETTINGS;

  if (pathname.includes('RapidBoard.jspa')) {
    if (params.get('config')) return Routes.SETTINGS;
    if (params.get('view') === 'reporting') return Routes.REPORTS;

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

export const getSettingsTab = () => {
  const search = new URLSearchParams(window.location.search);

  const tabFromUrl = search.get('tab') || search.get('config');

  return tabFromUrl
    ? Promise.resolve(tabFromUrl)
    : waitForElement('.aui-nav-selected').promise.then(selectedNav => selectedNav.dataset.tabitem);
};

export const getIssueId = () => {
  if (window.location.pathname.startsWith('/browse') || window.location.pathname.startsWith('/jira/browse')) {
    return window.location.pathname.split('/browse/')[1];
  }

  if (getSearchParam('selectedIssue') && (getSearchParam('view') || getSearchParam('modal')))
    return getSearchParam('selectedIssue');

  return null;
};

export const onUrlChange = cb => {
  extensionApiService.onMessage((request, sender, sendResponse) => {
    if (!sender.tab && request.type === types.TAB_URL_CHANGE) {
      cb(request.url);
      sendResponse({ message: 'change event received' });
    }
  });
};
