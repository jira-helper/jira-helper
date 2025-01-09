import { Token } from 'dioma';

export const BoardPagePageObject = {
  selectors: {
    pool: '#ghx-pool',
    issue: '.ghx-issue',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '.aui-sidebar.projects-sidebar .aui-navgroup.aui-navgroup-vertical',
    column: '.ghx-column',
  },

  classlist: {
    flagged: 'ghx-flagged',
  },

  getColumns(): string[] {
    const columns = Array.from(document.querySelectorAll(this.selectors.column)).map(
      column => column.textContent?.trim() || ''
    );
    return columns;
  },
};

export const boardPagePageObjectToken = new Token<typeof BoardPagePageObject>('boardPagePageObjectToken');
