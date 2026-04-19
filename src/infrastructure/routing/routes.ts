export const Routes = {
  BOARD: 'BOARD',
  BOARD_BACKLOG: 'BOARD_BACKLOG',
  SETTINGS: 'SETTINGS',
  SEARCH: 'SEARCH',
  REPORTS: 'REPORTS',
  ISSUE: 'ISSUE',
  ALL: 'ALL',
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
