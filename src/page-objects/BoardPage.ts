export class BoardPagePageObject {
  private static instance: BoardPagePageObject;

  public static selectors = {
    pool: '#ghx-pool',
    issue: '.ghx-issue',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
    sidebar: '.aui-sidebar.projects-sidebar .aui-navgroup.aui-navgroup-vertical',
    column: '.ghx-column',
  };

  public static classlist = {
    flagged: 'ghx-flagged',
  };

  public static getColumns(): string[] {
    const columns = Array.from(document.querySelectorAll(this.selectors.column)).map(
      column => column.textContent?.trim() || ''
    );
    return columns;
  }

  constructor() {
    if (BoardPagePageObject.instance) {
      // eslint-disable-next-line no-constructor-return
      return BoardPagePageObject.instance;
    }
    BoardPagePageObject.instance = this;
  }
}
