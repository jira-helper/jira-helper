export class BoardPagePageObject {
  private static instance: BoardPagePageObject;

  public static selectors = {
    pool: '#ghx-pool',
    issue: '.ghx-issue',
    flagged: '.ghx-flagged',
    grabber: '.ghx-grabber',
    grabberTransparent: '.ghx-grabber-transparent',
  };

  public static classlist = {
    flagged: 'ghx-flagged',
  };

  constructor() {
    if (BoardPagePageObject.instance) {
      // eslint-disable-next-line no-constructor-return
      return BoardPagePageObject.instance;
    }
    BoardPagePageObject.instance = this;
  }
}
