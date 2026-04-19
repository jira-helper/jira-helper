import { Container } from 'dioma';
import { types } from '../messages/actions';
import type { IExtensionApiService } from '../extension-api/ExtensionApiService';
import { extensionApiServiceToken } from '../extension-api/ExtensionApiService';
import type { IRoutingService } from './IRoutingService';
import { Routes, type Route } from './routes';
import { routingServiceToken } from './tokens';

export class RoutingService implements IRoutingService {
  constructor(private extensionApi: IExtensionApiService) {}

  getSearchParam(param: string): string | null {
    return new URLSearchParams(window.location.search).get(param);
  }

  /*
    sheme new 2022: https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/41/reports/control-chart?days=0
  */
  getReportNameFromURL(): string | null {
    const matchRapidView = window.location.pathname.match(/reports\/([^/?]*)/im);
    return matchRapidView ? matchRapidView[1] : null;
  }

  /*
    sheme old https://companyname.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12
    sheme new https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/12
    sheme new 2022: https://companyname.atlassian.net/jira/software/c/projects/{KEY}/boards/41/reports/control-chart?days=0
  */
  getBoardIdFromURL(): string | null {
    if (window.location.href.includes('rapidView')) {
      return this.getSearchParam('rapidView');
    }

    const matchRapidView = window.location.pathname.match(/boards\/(\d+)/im);
    return matchRapidView ? matchRapidView[1] : null;
  }

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
  getCurrentRoute(): Route | null {
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
  }

  getIssueId(): string | null {
    if (window.location.pathname.startsWith('/browse') || window.location.pathname.startsWith('/jira/browse')) {
      return window.location.pathname.split('/browse/')[1];
    }

    const selectedIssue = this.getSearchParam('selectedIssue');
    if (selectedIssue && (this.getSearchParam('view') || this.getSearchParam('modal'))) {
      return selectedIssue;
    }

    return null;
  }

  /*
    Old: https://company.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12
    New: https://company.atlassian.net/jira/software/c/projects/MP/boards/138
  */
  getProjectKeyFromURL(): string | null {
    const projectKeyFromQuery = this.getSearchParam('projectKey');
    if (projectKeyFromQuery) {
      return projectKeyFromQuery;
    }

    const match = window.location.pathname.match(/\/projects\/([A-Z]+)\//i);
    return match?.[1] ?? null;
  }

  onUrlChange(cb: (url: string) => void): void {
    this.extensionApi.onMessage((request: { type: string; url: string }, sender, sendResponse) => {
      if (!sender.tab && request.type === types.TAB_URL_CHANGE) {
        cb(request.url);
        sendResponse({ message: 'change event received' });
      }
    });
  }
}

export const registerRoutingServiceInDI = (container: Container) => {
  const extensionApi = container.inject(extensionApiServiceToken);
  container.register({
    token: routingServiceToken,
    value: new RoutingService(extensionApi),
  });
};
