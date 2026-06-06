import type { Route } from './routes';

export interface IRoutingService {
  getSearchParam(param: string): string | null;
  getReportNameFromURL(): string | null;
  getBoardIdFromURL(): string | null;
  getCurrentRoute(): Route | null;
  getIssueId(): string | null;
  getProjectKeyFromURL(): string | null;
  onUrlChange(cb: (url: string) => void): void;
}
