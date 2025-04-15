import { IBoardPagePageObject } from './BoardPage';

export const BoardPagePageObjectMock: IBoardPagePageObject = {
  selectors: {
    pool: '#ghx-pool',
    issue: '.ghx-issue',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '.ghx-sidebar',
    column: '.ghx-column',
    columnHeader: '.ghx-column-header',
    columnTitle: '.ghx-column-title',
  },
  classlist: {
    flagged: 'ghx-flagged',
  },
  getColumns: () => ['To Do', 'In Progress', 'Done'],
  listenCards: () => () => {},
  getColumnOfIssue: () => '',
  getHtml: () => '',
};
