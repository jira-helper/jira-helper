import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { PageModification } from '../shared/PageModification';

import { IssuesSubTasksProgress } from './components/SubTasksProgress/IssuesSubTasksProgress';

export class SubTasksProgressBoardPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `sub-tasks-progress-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    console.log('apply');
    setTimeout(() => {
      BoardPagePageObject.listenCards(cards => {
        console.log('listenCards');
        cards.forEach(card => card.attach(IssuesSubTasksProgress, 'sub-tasks-progress'));
      });
    }, 5000);
  }
}
